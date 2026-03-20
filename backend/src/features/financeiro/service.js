const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class FinanceiroService {

    async getMonthlyRevenue(ano = null) {
        try {
            const year = ano || new Date().getFullYear();
            const inicio = new Date(year, 0, 1);
            const fim = new Date(year, 11, 31, 23, 59, 59, 999);

            // Buscar todos os recebimentos do ano
            const receitas = await prisma.financeiro.findMany({
                where: {
                    tipo: 'RECEITA',
                    status: { in: ['PAGO', 'PARCIAL'] },
                    dataPagamento: {
                        gte: inicio,
                        lte: fim
                    }
                },
                select: {
                    dataPagamento: true,
                    valorPago: true
                }
            });

            // Agrupar por mês
            const monthly = Array(12).fill(0);
            for (const rec of receitas) {
                const month = new Date(rec.dataPagamento).getMonth();
                monthly[month] += rec.valorPago;
            }

            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return {
                ano: year,
                dados: meses.map((mes, idx) => ({
                    mes,
                    total: monthly[idx]
                }))
            };
        } catch (error) {
            console.error('Erro em getMonthlyRevenue:', error);
            throw error;
        }
    }

    // ==================== CONTAS A RECEBER ====================

    async listarContasReceber(filtros = {}) {
        try {
            const { page = 1, limit = 10, status, dataInicio, dataFim } = filtros;
            const skip = (page - 1) * limit;

            const where = { tipo: 'RECEITA' };

            if (status) where.status = status;

            if (dataInicio || dataFim) {
                where.dataVencimento = {};
                if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
                if (dataFim) where.dataVencimento.lte = new Date(dataFim);
            }

            const [contas, total] = await prisma.$transaction([
                prisma.financeiro.findMany({
                    where,
                    include: {
                        ordemServico: {
                            select: {
                                id: true,
                                numero: true,
                                cliente: { select: { nome: true } }
                            }
                        }
                    },
                    skip,
                    take: parseInt(limit),
                    orderBy: { dataVencimento: 'asc' }
                }),
                prisma.financeiro.count({ where })
            ]);

            return {
                data: contas,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Erro em listarContasReceber:', error);
            throw error;
        }
    }

    async buscarContaReceberPorId(id) {
        try {
            const conta = await prisma.financeiro.findUnique({
                where: { id: parseInt(id) },
                include: {
                    ordemServico: {
                        include: {
                            cliente: true,
                            servicos: true,
                            pecas: { include: { peca: true } }
                        }
                    }
                }
            });

            if (!conta) throw new Error('Conta não encontrada');
            if (conta.tipo !== 'RECEITA') throw new Error('Conta não é do tipo receita');

            return conta;
        } catch (error) {
            console.error('Erro em buscarContaReceberPorId:', error);
            throw error;
        }
    }

    async criarContaReceber(data, usuarioId) {
        try {
            // Verificar se a OS existe
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(data.ordemServicoId) }
            });
            if (!os) throw new Error('Ordem de serviço não encontrada');

            // Verificar se já existe conta para esta OS
            const contaExistente = await prisma.financeiro.findFirst({
                where: { ordemServicoId: parseInt(data.ordemServicoId) }
            });
            if (contaExistente) throw new Error('Esta OS já possui uma conta vinculada');

            const conta = await prisma.financeiro.create({
                data: {
                    ordemServicoId: parseInt(data.ordemServicoId),
                    tipo: 'RECEITA',
                    formaPagamento: data.formaPagamento,
                    parcelas: data.parcelas || 1,
                    valorTotal: data.valorTotal,
                    valorPago: 0,
                    status: 'PENDENTE',
                    dataVencimento: new Date(data.dataVencimento),
                    observacoes: data.observacoes
                },
                include: {
                    ordemServico: { select: { numero: true } }
                }
            });

            logger.info(`Conta a receber criada para OS ${os.numero} por usuário ${usuarioId}`);
            return conta;
        } catch (error) {
            console.error('Erro em criarContaReceber:', error);
            throw error;
        }
    }

    // ==================== CONTAS A PAGAR ====================

    async listarContasPagar(filtros = {}) {
        try {
            const { page = 1, limit = 10, status, categoria } = filtros;
            const skip = (page - 1) * limit;

            const where = { tipo: 'DESPESA' };

            if (status) where.status = status;
            if (categoria) where.categoria = categoria;

            const [contas, total] = await prisma.$transaction([
                prisma.financeiro.findMany({
                    where,
                    include: {
                        fornecedor: {
                            select: { id: true, razaoSocial: true }
                        }
                    },
                    skip,
                    take: parseInt(limit),
                    orderBy: { dataVencimento: 'asc' }
                }),
                prisma.financeiro.count({ where })
            ]);

            return {
                data: contas,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Erro em listarContasPagar:', error);
            throw error;
        }
    }

    async buscarContaPagarPorId(id) {
        try {
            const conta = await prisma.financeiro.findUnique({
                where: { id: parseInt(id) },
                include: {
                    fornecedor: true
                }
            });

            if (!conta) throw new Error('Conta não encontrada');
            if (conta.tipo !== 'DESPESA') throw new Error('Conta não é do tipo despesa');

            return conta;
        } catch (error) {
            console.error('Erro em buscarContaPagarPorId:', error);
            throw error;
        }
    }

    async criarContaPagar(data, usuarioId) {
        try {
            if (data.fornecedorId) {
                const fornecedor = await prisma.fornecedor.findUnique({
                    where: { id: parseInt(data.fornecedorId) }
                });
                if (!fornecedor) throw new Error('Fornecedor não encontrado');
            }

            const conta = await prisma.financeiro.create({
                data: {
                    tipo: 'DESPESA',
                    descricao: data.descricao,
                    formaPagamento: data.formaPagamento,
                    parcelas: data.parcelas || 1,
                    valorTotal: data.valorTotal,
                    valorPago: 0,
                    status: 'PENDENTE',
                    dataVencimento: new Date(data.dataVencimento),
                    categoria: data.categoria || 'OUTROS',
                    ordemServicoId: null,
                    fornecedorId: data.fornecedorId ? parseInt(data.fornecedorId) : null,
                    observacoes: data.observacoes
                }
            });

            logger.info(`Conta a pagar criada: ${data.descricao} por usuário ${usuarioId}`);
            return conta;
        } catch (error) {
            console.error('Erro em criarContaPagar:', error);
            throw error;
        }
    }

    // ==================== PAGAMENTOS ====================

    async registrarPagamento(id, data, usuarioId) {
        try {
            const conta = await prisma.financeiro.findUnique({
                where: { id: parseInt(id) }
            });

            if (!conta) throw new Error('Conta não encontrada');
            if (conta.status === 'CANCELADO') throw new Error('Conta cancelada não pode receber pagamento');
            if (conta.status === 'PAGO') throw new Error('Conta já está totalmente paga');

            const valorPago = data.valorPago || conta.valorTotal;
            const novoValorPago = conta.valorPago + valorPago;
            const novoStatus = novoValorPago >= conta.valorTotal ? 'PAGO' : 'PARCIAL';

            const contaAtualizada = await prisma.financeiro.update({
                where: { id: parseInt(id) },
                data: {
                    valorPago: novoValorPago,
                    status: novoStatus,
                    dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : new Date()
                }
            });

            // Se for conta a receber e foi totalmente paga, pode atualizar status da OS? (decisão de negócio)
            if (conta.tipo === 'RECEITA' && novoStatus === 'PAGO') {
                // Opcional: marcar OS como "FATURADA" ou algo assim
            }

            logger.info(`Pagamento registrado para conta ${id} por usuário ${usuarioId}`);
            return contaAtualizada;
        } catch (error) {
            console.error('Erro em registrarPagamento:', error);
            throw error;
        }
    }

    async estornarPagamento(id, motivo = null, usuarioId) {
        try {
            const conta = await prisma.financeiro.findUnique({
                where: { id: parseInt(id) }
            });

            if (!conta) throw new Error('Conta não encontrada');
            if (conta.status === 'CANCELADO') throw new Error('Conta já está cancelada');
            if (conta.status === 'PENDENTE') throw new Error('Conta não possui pagamentos para estornar');

            const contaAtualizada = await prisma.financeiro.update({
                where: { id: parseInt(id) },
                data: {
                    valorPago: 0,
                    status: 'PENDENTE',
                    dataPagamento: null,
                    observacoes: motivo ? `${conta.observacoes || ''} [Estorno: ${motivo}]` : conta.observacoes
                }
            });

            logger.info(`Pagamento estornado para conta ${id} por usuário ${usuarioId}`);
            return contaAtualizada;
        } catch (error) {
            console.error('Erro em estornarPagamento:', error);
            throw error;
        }
    }

    async cancelarConta(id, motivo = null, usuarioId) {
        try {
            const conta = await prisma.financeiro.findUnique({
                where: { id: parseInt(id) }
            });

            if (!conta) throw new Error('Conta não encontrada');
            if (conta.status === 'PAGO') throw new Error('Conta paga não pode ser cancelada');

            const contaAtualizada = await prisma.financeiro.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'CANCELADO',
                    observacoes: motivo ? `${conta.observacoes || ''} [Cancelado: ${motivo}]` : conta.observacoes
                }
            });

            logger.info(`Conta ${id} cancelada por usuário ${usuarioId}`);
            return contaAtualizada;
        } catch (error) {
            console.error('Erro em cancelarConta:', error);
            throw error;
        }
    }

    // ==================== FLUXO DE CAIXA ====================

    async getFluxoCaixa(dataInicio, dataFim) {
        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            const [receitas, despesas] = await Promise.all([
                prisma.financeiro.aggregate({
                    where: {
                        tipo: 'RECEITA',
                        status: { in: ['PAGO', 'PARCIAL'] },
                        dataPagamento: { gte: inicio, lte: fim }
                    },
                    _sum: { valorPago: true }
                }),
                prisma.financeiro.aggregate({
                    where: {
                        tipo: 'DESPESA',
                        status: { in: ['PAGO', 'PARCIAL'] },
                        dataPagamento: { gte: inicio, lte: fim }
                    },
                    _sum: { valorPago: true }
                })
            ]);

            const totalReceitas = receitas._sum.valorPago || 0;
            const totalDespesas = despesas._sum.valorPago || 0;

            return {
                periodo: { inicio, fim },
                totalReceitas,
                totalDespesas,
                saldo: totalReceitas - totalDespesas
            };
        } catch (error) {
            console.error('Erro em getFluxoCaixa:', error);
            throw error;
        }
    }

    async getDashboardData() {
        try {
            const hoje = new Date();
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            fimMes.setHours(23, 59, 59, 999);

            const [
                contasReceberMes,
                contasPagarMes,
                totalRecebidoMes,
                totalPagoMes,
                aReceberAtrasado,
                aPagarAtrasado
            ] = await Promise.all([
                // Contas a receber no mês (todas, independente do status)
                prisma.financeiro.count({
                    where: {
                        tipo: 'RECEITA',
                        dataVencimento: { gte: inicioMes, lte: fimMes }
                    }
                }),
                // Contas a pagar no mês
                prisma.financeiro.count({
                    where: {
                        tipo: 'DESPESA',
                        dataVencimento: { gte: inicioMes, lte: fimMes }
                    }
                }),
                // Total recebido no mês
                prisma.financeiro.aggregate({
                    where: {
                        tipo: 'RECEITA',
                        status: { in: ['PAGO', 'PARCIAL'] },
                        dataPagamento: { gte: inicioMes, lte: fimMes }
                    },
                    _sum: { valorPago: true }
                }),
                // Total pago no mês
                prisma.financeiro.aggregate({
                    where: {
                        tipo: 'DESPESA',
                        status: { in: ['PAGO', 'PARCIAL'] },
                        dataPagamento: { gte: inicioMes, lte: fimMes }
                    },
                    _sum: { valorPago: true }
                }),
                // Contas a receber atrasadas
                prisma.financeiro.count({
                    where: {
                        tipo: 'RECEITA',
                        status: { in: ['PENDENTE', 'PARCIAL'] },
                        dataVencimento: { lt: inicioMes }
                    }
                }),
                // Contas a pagar atrasadas
                prisma.financeiro.count({
                    where: {
                        tipo: 'DESPESA',
                        status: { in: ['PENDENTE', 'PARCIAL'] },
                        dataVencimento: { lt: inicioMes }
                    }
                })
            ]);

            return {
                contasReceberMes,
                contasPagarMes,
                totalRecebidoMes: totalRecebidoMes._sum.valorPago || 0,
                totalPagoMes: totalPagoMes._sum.valorPago || 0,
                aReceberAtrasado,
                aPagarAtrasado
            };
        } catch (error) {
            console.error('Erro em getDashboardData:', error);
            throw error;
        }
    }

    async getRelatorioPeriodo(dataInicio, dataFim) {
        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            const lancamentos = await prisma.financeiro.findMany({
                where: {
                    OR: [
                        { dataVencimento: { gte: inicio, lte: fim } },
                        { dataPagamento: { gte: inicio, lte: fim } }
                    ]
                },
                include: {
                    ordemServico: { include: { cliente: true } },
                    fornecedor: true
                },
                orderBy: { dataVencimento: 'asc' }
            });

            const resumo = {
                receitas: {
                    previstas: lancamentos.filter(l => l.tipo === 'RECEITA').reduce((acc, l) => acc + l.valorTotal, 0),
                    realizadas: lancamentos.filter(l => l.tipo === 'RECEITA' && l.status === 'PAGO').reduce((acc, l) => acc + l.valorTotal, 0)
                },
                despesas: {
                    previstas: lancamentos.filter(l => l.tipo === 'DESPESA').reduce((acc, l) => acc + l.valorTotal, 0),
                    realizadas: lancamentos.filter(l => l.tipo === 'DESPESA' && l.status === 'PAGO').reduce((acc, l) => acc + l.valorTotal, 0)
                }
            };

            return {
                periodo: { inicio, fim },
                lancamentos,
                resumo
            };
        } catch (error) {
            console.error('Erro em getRelatorioPeriodo:', error);
            throw error;
        }
    }
}

module.exports = new FinanceiroService();