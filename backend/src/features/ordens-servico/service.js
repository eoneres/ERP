const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const helpers = require('../../utils/helpers');

class OrdemServicoService {
    // Gerar número sequencial da OS
    async gerarNumero() {
        return await helpers.generateOsNumber(prisma);
    }

    // Listar OS com filtros
    async listar(filtros = {}) {
        try {
            const { page = 1, limit = 10, status, clienteId, veiculoId, periodoInicio, periodoFim } = filtros;
            const skip = (page - 1) * limit;

            const where = {};

            if (status) where.status = status;
            if (clienteId) where.clienteId = parseInt(clienteId);
            if (veiculoId) where.veiculoId = parseInt(veiculoId);

            if (periodoInicio || periodoFim) {
                where.dataAbertura = {};
                if (periodoInicio) where.dataAbertura.gte = new Date(periodoInicio);
                if (periodoFim) where.dataAbertura.lte = new Date(periodoFim);
            }

            const [ordens, total] = await prisma.$transaction([
                prisma.ordemServico.findMany({
                    where,
                    include: {
                        cliente: {
                            select: { id: true, nome: true, documento: true }
                        },
                        veiculo: {
                            select: { id: true, placa: true, marca: true, modelo: true }
                        },
                        mecanico: {
                            select: { id: true, nome: true }
                        },
                        servicos: {
                            include: { mecanico: { select: { nome: true } } }
                        },
                        pecas: {
                            include: { peca: { select: { codigo: true, descricao: true } } }
                        },
                        financeiro: true,
                        _count: {
                            select: { servicos: true, pecas: true }
                        }
                    },
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.ordemServico.count({ where })
            ]);

            return {
                data: ordens,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Erro em listar OS:', error);
            throw error;
        }
    }

    // Buscar OS por ID
    async buscarPorId(id) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(id) },
                include: {
                    cliente: true,
                    veiculo: true,
                    mecanico: { select: { id: true, nome: true, email: true } },
                    servicos: {
                        include: { mecanico: { select: { id: true, nome: true } } },
                        orderBy: { createdAt: 'asc' }
                    },
                    pecas: {
                        include: { peca: true },
                        orderBy: { createdAt: 'asc' }
                    },
                    fotos: true,
                    financeiro: true,
                    agendamento: {
                        select: { id: true, dataHora: true, status: true }
                    }
                }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');

            return os;
        } catch (error) {
            console.error('Erro em buscar OS por ID:', error);
            throw error;
        }
    }

    // Criar OS
    async criar(data, usuarioId) {
        try {
            const numero = await this.gerarNumero();

            // Verificar se cliente existe
            const cliente = await prisma.cliente.findUnique({
                where: { id: parseInt(data.clienteId) }
            });
            if (!cliente) throw new Error('Cliente não encontrado');

            // Verificar se veículo existe e pertence ao cliente
            const veiculo = await prisma.veiculo.findFirst({
                where: {
                    id: parseInt(data.veiculoId),
                    clienteId: parseInt(data.clienteId)
                }
            });
            if (!veiculo) throw new Error('Veículo não encontrado ou não pertence ao cliente');

            // Se informado agendamento, verificar se existe e não está vinculado a outra OS
            if (data.agendamentoId) {
                const agendamento = await prisma.agendamento.findUnique({
                    where: { id: parseInt(data.agendamentoId) },
                    include: { ordemServico: true }
                });
                if (!agendamento) throw new Error('Agendamento não encontrado');
                if (agendamento.ordemServico) throw new Error('Agendamento já possui uma OS vinculada');
            }

            const os = await prisma.ordemServico.create({
                data: {
                    numero,
                    clienteId: parseInt(data.clienteId),
                    veiculoId: parseInt(data.veiculoId),
                    kmEntrada: parseInt(data.kmEntrada),
                    tipo: data.tipo || 'SERVICO',
                    observacoes: data.observacoes,
                    agendamentoId: data.agendamentoId ? parseInt(data.agendamentoId) : null,
                    status: 'ABERTA'
                },
                include: {
                    cliente: { select: { nome: true } },
                    veiculo: { select: { placa: true } }
                }
            });

            logger.info(`OS criada: ${os.numero} por usuário ${usuarioId}`);
            return os;
        } catch (error) {
            console.error('Erro em criar OS:', error);
            throw error;
        }
    }

    // Atualizar OS (dados gerais)
    async atualizar(id, data) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(id) }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');

            // Se estiver alterando veículo, verificar pertence ao cliente
            if (data.veiculoId && data.veiculoId !== os.veiculoId) {
                const clienteId = data.clienteId || os.clienteId;
                const veiculo = await prisma.veiculo.findFirst({
                    where: {
                        id: parseInt(data.veiculoId),
                        clienteId: parseInt(clienteId)
                    }
                });
                if (!veiculo) throw new Error('Veículo não encontrado ou não pertence ao cliente');
            }

            const osAtualizada = await prisma.ordemServico.update({
                where: { id: parseInt(id) },
                data: {
                    kmSaida: data.kmSaida !== undefined ? parseInt(data.kmSaida) : undefined,
                    status: data.status,
                    observacoes: data.observacoes,
                    mecanicoResponsavelId: data.mecanicoId ? parseInt(data.mecanicoId) : undefined
                }
            });

            logger.info(`OS atualizada: ${os.numero}`);
            return osAtualizada;
        } catch (error) {
            console.error('Erro em atualizar OS:', error);
            throw error;
        }
    }

    // Adicionar serviço à OS
    async adicionarServico(osId, data, usuarioId) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(osId) }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');
            if (os.status === 'CANCELADA' || os.status === 'CONCLUIDA' || os.status === 'ENTREGUE') {
                throw new Error('Não é possível adicionar serviços a uma OS cancelada, concluída ou entregue');
            }

            const quantidade = data.quantidade || 1;
            const total = (data.valorUnitario || 0) * quantidade - (data.desconto || 0);

            const servico = await prisma.servicoOS.create({
                data: {
                    ordemServicoId: parseInt(osId),
                    descricao: data.descricao,
                    valorUnitario: data.valorUnitario,
                    quantidade,
                    desconto: data.desconto || 0,
                    total,
                    status: 'PENDENTE',
                    mecanicoId: data.mecanicoId ? parseInt(data.mecanicoId) : null,
                    observacoes: data.observacoes
                }
            });

            logger.info(`Serviço adicionado à OS ${os.numero} por usuário ${usuarioId}`);
            return servico;
        } catch (error) {
            console.error('Erro em adicionar serviço:', error);
            throw error;
        }
    }

    // Adicionar peça à OS (com baixa no estoque)
    async adicionarPeca(osId, data, usuarioId) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(osId) }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');
            if (os.status === 'CANCELADA' || os.status === 'CONCLUIDA' || os.status === 'ENTREGUE') {
                throw new Error('Não é possível adicionar peças a uma OS cancelada, concluída ou entregue');
            }

            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(data.pecaId) }
            });
            if (!peca) throw new Error('Peça não encontrada');
            if (peca.estoqueAtual < data.quantidade) {
                throw new Error(`Estoque insuficiente. Disponível: ${peca.estoqueAtual}`);
            }

            const valorUnitario = data.valorUnitario || peca.precoVenda;
            const total = valorUnitario * data.quantidade - (data.desconto || 0);

            const pecaOS = await prisma.pecaOS.create({
                data: {
                    ordemServicoId: parseInt(osId),
                    pecaId: parseInt(data.pecaId),
                    quantidade: parseInt(data.quantidade),
                    valorUnitario,
                    desconto: data.desconto || 0,
                    total
                }
            });

            // Baixar do estoque (saída por venda)
            await prisma.peca.update({
                where: { id: parseInt(data.pecaId) },
                data: { estoqueAtual: { decrement: parseInt(data.quantidade) } }
            });

            // Registrar movimentação de estoque
            await prisma.movimentacaoEstoque.create({
                data: {
                    pecaId: parseInt(data.pecaId),
                    tipo: 'SAIDA',
                    quantidade: parseInt(data.quantidade),
                    motivo: 'VENDA',
                    documento: `OS-${os.numero}`,
                    observacoes: `Vinculado à OS ${os.numero}`,
                    usuarioId: parseInt(usuarioId)
                }
            });

            logger.info(`Peça adicionada à OS ${os.numero} por usuário ${usuarioId}`);
            return pecaOS;
        } catch (error) {
            console.error('Erro em adicionar peça:', error);
            throw error;
        }
    }

    // Remover serviço ou peça da OS
    async removerItem(osId, itemId, tipo, usuarioId) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(osId) }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');
            if (os.status === 'CANCELADA' || os.status === 'CONCLUIDA' || os.status === 'ENTREGUE') {
                throw new Error('Não é possível remover itens de uma OS cancelada, concluída ou entregue');
            }

            if (tipo === 'servico') {
                const servico = await prisma.servicoOS.findFirst({
                    where: { id: parseInt(itemId), ordemServicoId: parseInt(osId) }
                });
                if (!servico) throw new Error('Serviço não encontrado nesta OS');
                await prisma.servicoOS.delete({ where: { id: parseInt(itemId) } });
            } else if (tipo === 'peca') {
                const pecaOS = await prisma.pecaOS.findFirst({
                    where: { id: parseInt(itemId), ordemServicoId: parseInt(osId) },
                    include: { peca: true }
                });
                if (!pecaOS) throw new Error('Peça não encontrada nesta OS');

                // Devolver ao estoque
                await prisma.peca.update({
                    where: { id: pecaOS.pecaId },
                    data: { estoqueAtual: { increment: pecaOS.quantidade } }
                });

                // Registrar movimentação de devolução com o usuário correto
                await prisma.movimentacaoEstoque.create({
                    data: {
                        pecaId: pecaOS.pecaId,
                        tipo: 'ENTRADA',
                        quantidade: pecaOS.quantidade,
                        motivo: 'DEVOLUCAO',
                        documento: `OS-${os.numero}-CANCEL`,
                        observacoes: `Devolução de peça da OS ${os.numero}`,
                        usuarioId: parseInt(usuarioId)
                    }
                });

                await prisma.pecaOS.delete({ where: { id: parseInt(itemId) } });
            }

            logger.info(`Item removido da OS ${os.numero}`);
            return { message: 'Item removido com sucesso' };
        } catch (error) {
            console.error('Erro em remover item:', error);
            throw error;
        }
    }

    // Alterar status da OS
    async alterarStatus(osId, status, motivo = null, usuarioId) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(osId) },
                include: { servicos: true, pecas: true }
            });

            if (!os) throw new Error('Ordem de serviço não encontrada');

            // Validações de transição de status
            if (status === 'CONCLUIDA') {
                if (os.servicos.length === 0 && os.pecas.length === 0) {
                    throw new Error('Não é possível concluir uma OS sem serviços ou peças');
                }
                if (!os.kmSaida) {
                    throw new Error('Quilometragem de saída é obrigatória para concluir');
                }
            }

            if (status === 'ENTREGUE' && os.status !== 'CONCLUIDA') {
                throw new Error('Apenas OS concluídas podem ser entregues');
            }

            if (status === 'CANCELADA' && os.status === 'ENTREGUE') {
                throw new Error('Não é possível cancelar uma OS já entregue');
            }

            // Se for cancelar, devolver peças ao estoque
            if (status === 'CANCELADA' && os.status !== 'CANCELADA') {
                for (const pecaOS of os.pecas) {
                    await prisma.peca.update({
                        where: { id: pecaOS.pecaId },
                        data: { estoqueAtual: { increment: pecaOS.quantidade } }
                    });
                    await prisma.movimentacaoEstoque.create({
                        data: {
                            pecaId: pecaOS.pecaId,
                            tipo: 'ENTRADA',
                            quantidade: pecaOS.quantidade,
                            motivo: 'DEVOLUCAO',
                            documento: `OS-${os.numero}-CANCEL`,
                            observacoes: `Cancelamento da OS ${os.numero}`,
                            usuarioId: parseInt(usuarioId)
                        }
                    });
                }
            }

            const osAtualizada = await prisma.ordemServico.update({
                where: { id: parseInt(osId) },
                data: {
                    status,
                    observacoes: motivo ? `${os.observacoes || ''} [${status}: ${motivo}]` : os.observacoes
                }
            });

            logger.info(`Status da OS ${os.numero} alterado para ${status} por usuário ${usuarioId}`);
            return osAtualizada;
        } catch (error) {
            console.error('Erro em alterar status:', error);
            throw error;
        }
    }

    async getResumoFinanceiro(osId) {
        try {
            const os = await prisma.ordemServico.findUnique({
                where: { id: parseInt(osId) },
                include: {
                    servicos: true,
                    pecas: true,
                    financeiro: true
                }
            });

            if (!os) throw new Error('OS não encontrada');

            const totalServicos = os.servicos.reduce((acc, s) => acc + s.total, 0);
            const totalPecas = os.pecas.reduce((acc, p) => acc + p.total, 0);
            const totalGeral = totalServicos + totalPecas;

            return {
                totalServicos,
                totalPecas,
                totalGeral,
                pago: os.financeiro?.reduce((acc, f) => acc + (f.valorPago || 0), 0) || 0,
                pendente: totalGeral - (os.financeiro?.reduce((acc, f) => acc + (f.valorPago || 0), 0) || 0)
            };
        } catch (error) {
            console.error('Erro em resumo financeiro:', error);
            throw error;
        }
    }

    async getRelatorio(dataInicio, dataFim) {
        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            // Buscar OS no período
            const ordens = await prisma.ordemServico.findMany({
                where: {
                    dataAbertura: {
                        gte: inicio,
                        lte: fim
                    }
                },
                include: {
                    cliente: { select: { nome: true } },
                    servicos: true,
                    pecas: true,
                    financeiro: true
                },
                orderBy: { dataAbertura: 'asc' }
            });

            // Calcular totais
            const totalOS = ordens.length;
            const totalValor = ordens.reduce((acc, os) => {
                const valorServicos = os.servicos.reduce((s, serv) => s + serv.total, 0);
                const valorPecas = os.pecas.reduce((p, peca) => p + peca.total, 0);
                return acc + valorServicos + valorPecas;
            }, 0);
            const totalRecebido = ordens.reduce((acc, os) => {
                return acc + (os.financeiro?.reduce((f, fin) => f + (fin.valorPago || 0), 0) || 0);
            }, 0);

            // Agrupar por status
            const porStatus = {};
            for (const os of ordens) {
                porStatus[os.status] = (porStatus[os.status] || 0) + 1;
            }

            return {
                periodo: { inicio, fim },
                totalOS,
                totalValor,
                totalRecebido,
                porStatus,
                ordens
            };
        } catch (error) {
            console.error('Erro em getRelatorio:', error);
            throw error;
        }
    }

    async getTopServicos(dataInicio, dataFim, limit = 10) {
        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            const servicos = await prisma.servicoOS.findMany({
                where: {
                    createdAt: {
                        gte: inicio,
                        lte: fim
                    }
                },
                select: {
                    descricao: true,
                    total: true
                }
            });

            // Agrupar por descrição
            const agrupado = {};
            for (const s of servicos) {
                if (!agrupado[s.descricao]) {
                    agrupado[s.descricao] = { quantidade: 0, valor: 0 };
                }
                agrupado[s.descricao].quantidade++;
                agrupado[s.descricao].valor += s.total;
            }

            const top = Object.entries(agrupado)
                .map(([descricao, data]) => ({ descricao, ...data }))
                .sort((a, b) => b.valor - a.valor)
                .slice(0, limit);

            return top;
        } catch (error) {
            console.error('Erro em getTopServicos:', error);
            throw error;
        }
    }

}

module.exports = new OrdemServicoService();