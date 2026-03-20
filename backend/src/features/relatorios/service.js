const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');

class RelatoriosService {
    // ==================== RELATÓRIOS DE VENDAS ====================

    async relatorioVendas(filtros = {}) {
        const { dataInicio, dataFim, formaPagamento, clienteId } = filtros;

        const where = {
            tipo: 'RECEITA',
            status: 'PAGO'
        };

        if (dataInicio || dataFim) {
            where.dataPagamento = {};
            if (dataInicio) where.dataPagamento.gte = new Date(dataInicio);
            if (dataFim) where.dataPagamento.lte = new Date(dataFim);
        }

        if (formaPagamento) where.formaPagamento = formaPagamento;
        if (clienteId) {
            where.ordemServico = {
                clienteId: parseInt(clienteId)
            };
        }

        // Buscar vendas
        const vendas = await prisma.financeiro.findMany({
            where,
            include: {
                ordemServico: {
                    include: {
                        cliente: {
                            select: {
                                nome: true,
                                documento: true,
                                telefone1: true
                            }
                        },
                        veiculo: {
                            select: {
                                placa: true,
                                marca: true,
                                modelo: true
                            }
                        },
                        servicos: {
                            select: {
                                descricao: true,
                                valorUnitario: true,
                                quantidade: true,
                                total: true
                            }
                        },
                        pecas: {
                            include: {
                                peca: {
                                    select: {
                                        descricao: true,
                                        codigo: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { dataPagamento: 'desc' }
        });

        // Métricas
        const totalVendas = vendas.length;
        const valorTotal = vendas.reduce((acc, v) => acc + v.valorPago, 0);
        const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

        // Agrupamentos
        const porFormaPagamento = this.agruparPor(vendas, 'formaPagamento');
        const porDia = this.agruparPorDia(vendas);
        const porCliente = this.agruparPorCliente(vendas);

        return {
            periodo: {
                dataInicio: dataInicio || 'Todo período',
                dataFim: dataFim || 'Todo período'
            },
            resumo: {
                totalVendas,
                valorTotal,
                ticketMedio,
                valorMedio: ticketMedio
            },
            agrupamentos: {
                porFormaPagamento,
                porDia,
                porCliente: porCliente.slice(0, 10) // Top 10 clientes
            },
            vendas: vendas.map(v => ({
                id: v.id,
                data: v.dataPagamento,
                cliente: v.ordemServico?.cliente?.nome,
                documento: v.ordemServico?.cliente?.documento,
                veiculo: v.ordemServico?.veiculo?.placa,
                os: v.ordemServico?.numero,
                formaPagamento: v.formaPagamento,
                valor: v.valorPago,
                servicos: v.ordemServico?.servicos?.length || 0,
                pecas: v.ordemServico?.pecas?.length || 0
            }))
        };
    }

    // ==================== RELATÓRIOS DE SERVIÇOS ====================

    async relatorioServicos(filtros = {}) {
        const { dataInicio, dataFim, mecanicoId, status } = filtros;

        const where = {};

        if (dataInicio || dataFim) {
            where.createdAt = {};
            if (dataInicio) where.createdAt.gte = new Date(dataInicio);
            if (dataFim) where.createdAt.lte = new Date(dataFim);
        }

        if (mecanicoId) where.mecanicoId = parseInt(mecanicoId);
        if (status) where.status = status;

        const servicos = await prisma.servicoOS.findMany({
            where,
            include: {
                ordemServico: {
                    include: {
                        cliente: {
                            select: {
                                nome: true
                            }
                        },
                        veiculo: {
                            select: {
                                placa: true,
                                marca: true,
                                modelo: true
                            }
                        }
                    }
                },
                mecanico: {
                    select: {
                        nome: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Métricas
        const totalServicos = servicos.length;
        const valorTotal = servicos.reduce((acc, s) => acc + s.total, 0);
        const servicosConcluidos = servicos.filter(s => s.status === 'CONCLUIDO').length;
        const tempoMedioExecucao = await this.calcularTempoMedioServicos(dataInicio, dataFim);

        // Agrupamentos
        const porStatus = this.agruparPor(servicos, 'status');
        const porMecanico = this.agruparPorMecanico(servicos);
        const servicosMaisRealizados = this.servicosMaisRealizados(servicos);

        return {
            periodo: {
                dataInicio: dataInicio || 'Todo período',
                dataFim: dataFim || 'Todo período'
            },
            resumo: {
                totalServicos,
                valorTotal,
                servicosConcluidos,
                taxaConclusao: totalServicos > 0 ? (servicosConcluidos / totalServicos) * 100 : 0,
                tempoMedioExecucao
            },
            agrupamentos: {
                porStatus,
                porMecanico,
                servicosMaisRealizados
            },
            servicos: servicos.map(s => ({
                id: s.id,
                data: s.createdAt,
                descricao: s.descricao,
                cliente: s.ordemServico?.cliente?.nome,
                veiculo: `${s.ordemServico?.veiculo?.marca} ${s.ordemServico?.veiculo?.modelo} - ${s.ordemServico?.veiculo?.placa}`,
                mecanico: s.mecanico?.nome,
                valor: s.total,
                status: s.status,
                os: s.ordemServico?.numero
            }))
        };
    }

    // ==================== RELATÓRIOS DE CLIENTES ====================

    async relatorioClientes(filtros = {}) {
        const { dataInicio, dataFim, top = 20 } = filtros;

        const whereOS = {};
        if (dataInicio || dataFim) {
            whereOS.createdAt = {};
            if (dataInicio) whereOS.createdAt.gte = new Date(dataInicio);
            if (dataFim) whereOS.createdAt.lte = new Date(dataFim);
        }

        const clientes = await prisma.cliente.findMany({
            where: { ativo: true },
            include: {
                veiculos: {
                    where: { ativo: true }
                },
                ordensServico: {
                    where: whereOS,
                    include: {
                        servicos: true,
                        pecas: true
                    }
                },
                agendamentos: {
                    where: {
                        createdAt: whereOS.createdAt
                    }
                }
            }
        });

        // Calcular métricas por cliente
        const clientesComMetricas = clientes.map(cliente => {
            const totalOS = cliente.ordensServico.length;
            const totalGasto = cliente.ordensServico.reduce((acc, os) => {
                const totalServicos = os.servicos.reduce((sAcc, s) => sAcc + s.total, 0);
                const totalPecas = os.pecas.reduce((pAcc, p) => pAcc + p.total, 0);
                return acc + totalServicos + totalPecas;
            }, 0);

            const ultimaOS = cliente.ordensServico.length > 0
                ? cliente.ordensServico.sort((a, b) => b.createdAt - a.createdAt)[0]
                : null;

            return {
                id: cliente.id,
                nome: cliente.nome,
                documento: cliente.documento,
                telefone: cliente.telefone1,
                email: cliente.email,
                totalVeiculos: cliente.veiculos.length,
                totalOS,
                totalGasto,
                ticketMedio: totalOS > 0 ? totalGasto / totalOS : 0,
                totalAgendamentos: cliente.agendamentos.length,
                ultimaVisita: ultimaOS?.createdAt,
                ultimoVeiculo: ultimaOS?.veiculoId
            };
        });

        // Ordenar e pegar top clientes
        const topClientes = clientesComMetricas
            .sort((a, b) => b.totalGasto - a.totalGasto)
            .slice(0, parseInt(top));

        // Métricas gerais
        const totalClientes = clientes.length;
        const totalGastoGeral = clientesComMetricas.reduce((acc, c) => acc + c.totalGasto, 0);
        const ticketMedioGeral = totalClientes > 0 ? totalGastoGeral / totalClientes : 0;

        return {
            periodo: {
                dataInicio: dataInicio || 'Todo período',
                dataFim: dataFim || 'Todo período'
            },
            resumo: {
                totalClientesAtivos: totalClientes,
                totalGastoGeral,
                ticketMedioGeral,
                clientesComOS: clientesComMetricas.filter(c => c.totalOS > 0).length,
                clientesInativos: clientesComMetricas.filter(c => c.totalOS === 0).length
            },
            topClientes,
            distribuicao: {
                porTotalGasto: this.categorizarClientesPorGasto(clientesComMetricas),
                porFrequencia: this.categorizarClientesPorFrequencia(clientesComMetricas)
            }
        };
    }

    // ==================== RELATÓRIOS DE VEÍCULOS ====================

    async relatorioVeiculos(filtros = {}) {
        const { dataInicio, dataFim, marca, modelo } = filtros;

        const where = { ativo: true };
        if (marca) where.marca = { contains: marca, mode: 'insensitive' };
        if (modelo) where.modelo = { contains: modelo, mode: 'insensitive' };

        const whereOS = {};
        if (dataInicio || dataFim) {
            whereOS.createdAt = {};
            if (dataInicio) whereOS.createdAt.gte = new Date(dataInicio);
            if (dataFim) whereOS.createdAt.lte = new Date(dataFim);
        }

        const veiculos = await prisma.veiculo.findMany({
            where,
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone1: true
                    }
                },
                ordensServico: {
                    where: whereOS,
                    include: {
                        servicos: true
                    }
                }
            }
        });

        // Calcular métricas por veículo
        const veiculosComMetricas = veiculos.map(veiculo => {
            const totalOS = veiculo.ordensServico.length;
            const totalServicos = veiculo.ordensServico.reduce((acc, os) =>
                acc + os.servicos.reduce((sAcc, s) => sAcc + s.total, 0), 0
            );
            const ultimaOS = veiculo.ordensServico.length > 0
                ? veiculo.ordensServico.sort((a, b) => b.createdAt - a.createdAt)[0]
                : null;

            return {
                id: veiculo.id,
                placa: veiculo.placa,
                veiculo: `${veiculo.marca} ${veiculo.modelo} ${veiculo.anoModelo}`,
                cor: veiculo.cor,
                cliente: veiculo.cliente?.nome,
                kmAtual: veiculo.kmAtual,
                totalOS,
                totalGastoServicos: totalServicos,
                ultimaVisita: ultimaOS?.createdAt,
                ultimoServico: ultimaOS?.servicos[0]?.descricao
            };
        });

        // Agrupamentos
        const porMarca = this.agruparPor(veiculos, 'marca');
        const porAno = this.agruparPorAno(veiculos);

        return {
            periodo: {
                dataInicio: dataInicio || 'Todo período',
                dataFim: dataFim || 'Todo período'
            },
            resumo: {
                totalVeiculos: veiculos.length,
                totalOSPeriodo: veiculos.reduce((acc, v) => acc + v.ordensServico.length, 0),
                kmMedia: veiculos.reduce((acc, v) => acc + v.kmAtual, 0) / veiculos.length,
                veiculosSemOS: veiculos.filter(v => v.ordensServico.length === 0).length
            },
            agrupamentos: {
                porMarca,
                porAno
            },
            veiculos: veiculosComMetricas
        };
    }

    // ==================== RELATÓRIOS DE ESTOQUE ====================

    async relatorioEstoque(filtros = {}) {
        const { categoria, marca, apenasBaixo, incluirMovimentacoes } = filtros;

        const where = { ativo: true };
        if (categoria) where.categoria = categoria;
        if (marca) where.marca = marca;

        const pecas = await prisma.peca.findMany({
            where,
            include: {
                fornecedor: {
                    select: {
                        razaoSocial: true
                    }
                },
                movimentacoes: incluirMovimentacoes ? {
                    take: 50,
                    orderBy: { createdAt: 'desc' }
                } : false
            },
            orderBy: { codigo: 'asc' }
        });

        // Filtrar apenas baixo estoque se solicitado
        let pecasFiltradas = pecas;
        if (apenasBaixo === 'true') {
            pecasFiltradas = pecas.filter(p =>
                p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo
            );
        }

        // Métricas
        const valorTotalEstoque = pecas.reduce((acc, p) => acc + (p.estoqueAtual * p.precoCusto), 0);
        const valorTotalVenda = pecas.reduce((acc, p) => acc + (p.estoqueAtual * p.precoVenda), 0);

        const pecasBaixoEstoque = pecas.filter(p =>
            p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo
        );
        const pecasSemEstoque = pecas.filter(p => p.estoqueAtual === 0);
        const pecasExcedente = pecas.filter(p =>
            p.estoqueMaximo > 0 && p.estoqueAtual >= p.estoqueMaximo
        );

        // Agrupamentos
        const porCategoria = this.agruparPor(pecas, 'categoria');
        const porFornecedor = this.agruparPorFornecedor(pecas);

        return {
            resumo: {
                totalItens: pecas.length,
                valorTotalEstoque,
                valorTotalVenda,
                lucroPotencial: valorTotalVenda - valorTotalEstoque,
                itensBaixoEstoque: pecasBaixoEstoque.length,
                itensSemEstoque: pecasSemEstoque.length,
                itensExcedente: pecasExcedente.length
            },
            agrupamentos: {
                porCategoria,
                porFornecedor
            },
            alertas: {
                baixoEstoque: pecasBaixoEstoque.map(p => ({
                    codigo: p.codigo,
                    descricao: p.descricao,
                    atual: p.estoqueAtual,
                    minimo: p.estoqueMinimo,
                    fornecedor: p.fornecedor?.razaoSocial
                })),
                semEstoque: pecasSemEstoque.map(p => ({
                    codigo: p.codigo,
                    descricao: p.descricao,
                    fornecedor: p.fornecedor?.razaoSocial
                }))
            },
            pecas: pecasFiltradas.map(p => ({
                codigo: p.codigo,
                descricao: p.descricao,
                categoria: p.categoria,
                marca: p.marca,
                localizacao: p.localizacao,
                estoqueAtual: p.estoqueAtual,
                estoqueMinimo: p.estoqueMinimo,
                estoqueMaximo: p.estoqueMaximo,
                precoCusto: p.precoCusto,
                precoVenda: p.precoVenda,
                valorEstoque: p.estoqueAtual * p.precoCusto,
                fornecedor: p.fornecedor?.razaoSocial,
                status: this.calcularStatusEstoque(p)
            }))
        };
    }

    // ==================== DASHBOARD COMPLETO ====================

    async getDashboardCompleto() {
        const hoje = new Date();
        const inicioHoje = new Date(hoje.setHours(0, 0, 0, 0));
        const fimHoje = new Date(hoje.setHours(23, 59, 59, 999));

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
        const fimSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 6));

        const [
            // Financeiro
            faturamentoHoje,
            faturamentoMes,
            despesasMes,
            contasVencer,
            contasVencidas,

            // OS
            osAbertas,
            osEmAndamento,
            osConcluidasHoje,

            // Agendamentos
            agendamentosHoje,
            agendamentosSemana,

            // Estoque
            alertasEstoque,
            valorEstoque,

            // Clientes
            novosClientesMes,
            clientesAtivos,

            // Gráficos
            vendasPorDia,
            servicosPorTipo,
            topClientes
        ] = await Promise.all([
            // Faturamento hoje
            prisma.financeiro.aggregate({
                where: {
                    tipo: 'RECEITA',
                    status: 'PAGO',
                    dataPagamento: {
                        gte: inicioHoje,
                        lte: fimHoje
                    }
                },
                _sum: { valorPago: true }
            }),

            // Faturamento mês
            prisma.financeiro.aggregate({
                where: {
                    tipo: 'RECEITA',
                    status: 'PAGO',
                    dataPagamento: {
                        gte: inicioMes,
                        lte: fimMes
                    }
                },
                _sum: { valorPago: true }
            }),

            // Despesas mês
            prisma.financeiro.aggregate({
                where: {
                    tipo: 'DESPESA',
                    status: 'PAGO',
                    dataPagamento: {
                        gte: inicioMes,
                        lte: fimMes
                    }
                },
                _sum: { valorPago: true }
            }),

            // Contas a vencer (7 dias)
            prisma.financeiro.count({
                where: {
                    status: 'PENDENTE',
                    dataVencimento: {
                        gte: new Date(),
                        lte: new Date(new Date().setDate(new Date().getDate() + 7))
                    }
                }
            }),

            // Contas vencidas
            prisma.financeiro.count({
                where: {
                    status: 'PENDENTE',
                    dataVencimento: {
                        lt: new Date()
                    }
                }
            }),

            // OS abertas
            prisma.ordemServico.count({
                where: {
                    status: { notIn: ['ENTREGUE', 'CANCELADA'] }
                }
            }),

            // OS em andamento
            prisma.ordemServico.count({
                where: { status: 'EM_EXECUCAO' }
            }),

            // OS concluídas hoje
            prisma.ordemServico.count({
                where: {
                    status: 'ENTREGUE',
                    dataFechamento: {
                        gte: inicioHoje,
                        lte: fimHoje
                    }
                }
            }),

            // Agendamentos hoje
            prisma.agendamento.count({
                where: {
                    dataHora: {
                        gte: inicioHoje,
                        lte: fimHoje
                    },
                    status: { notIn: ['CANCELADO', 'CONCLUIDO'] }
                }
            }),

            // Agendamentos semana
            prisma.agendamento.count({
                where: {
                    dataHora: {
                        gte: inicioSemana,
                        lte: fimSemana
                    },
                    status: { notIn: ['CANCELADO', 'CONCLUIDO'] }
                }
            }),

            // Alertas de estoque
            prisma.peca.count({
                where: {
                    ativo: true,
                    AND: [
                        { estoqueAtual: { lte: prisma.peca.fields.estoqueMinimo } },
                        { estoqueMinimo: { gt: 0 } }
                    ]
                }
            }),

            // Valor em estoque
            prisma.peca.aggregate({
                where: { ativo: true },
                _sum: {
                    precoCusto: true
                }
            }),

            // Novos clientes no mês
            prisma.cliente.count({
                where: {
                    createdAt: {
                        gte: inicioMes,
                        lte: fimMes
                    }
                }
            }),

            // Clientes ativos (com OS no mês)
            prisma.cliente.count({
                where: {
                    ordensServico: {
                        some: {
                            createdAt: {
                                gte: inicioMes,
                                lte: fimMes
                            }
                        }
                    }
                }
            }),

            // Vendas por dia (últimos 7 dias)
            this.getVendasPorDia(7),

            // Serviços mais realizados
            this.getServicosPorTipo(10),

            // Top 5 clientes
            this.getTopClientes(5)
        ]);

        return {
            metricas: {
                financeiro: {
                    faturamentoHoje: faturamentoHoje._sum.valorPago || 0,
                    faturamentoMes: faturamentoMes._sum.valorPago || 0,
                    despesasMes: despesasMes._sum.valorPago || 0,
                    saldoMes: (faturamentoMes._sum.valorPago || 0) - (despesasMes._sum.valorPago || 0),
                    contasAVencer: contasVencer,
                    contasVencidas
                },
                operacional: {
                    osAbertas,
                    osEmAndamento,
                    osConcluidasHoje,
                    agendamentosHoje,
                    agendamentosSemana
                },
                estoque: {
                    alertas: alertasEstoque,
                    valorTotal: valorEstoque._sum.precoCusto || 0
                },
                clientes: {
                    novosMes: novosClientesMes,
                    ativosMes: clientesAtivos
                }
            },
            graficos: {
                vendasPorDia,
                servicosPorTipo,
                topClientes
            },
            alertas: {
                contasVencidas: contasVencidas > 0,
                estoqueBaixo: alertasEstoque > 0,
                agendamentosPendentes: agendamentosHoje > 0
            }
        };
    }

    // ==================== FUNÇÕES AUXILIARES ====================

    agruparPor(array, campo) {
        const grouped = {};
        array.forEach(item => {
            const key = item[campo] || 'Não informado';
            if (!grouped[key]) {
                grouped[key] = {
                    chave: key,
                    quantidade: 0,
                    valor: 0
                };
            }
            grouped[key].quantidade++;
            grouped[key].valor += item.valorPago || item.total || 1;
        });
        return Object.values(grouped).sort((a, b) => b.valor - a.valor);
    }

    agruparPorDia(vendas) {
        const dias = {};
        vendas.forEach(venda => {
            const dia = venda.dataPagamento.toISOString().split('T')[0];
            if (!dias[dia]) {
                dias[dia] = {
                    data: dia,
                    quantidade: 0,
                    valor: 0
                };
            }
            dias[dia].quantidade++;
            dias[dia].valor += venda.valorPago;
        });
        return Object.values(dias).sort((a, b) => a.data.localeCompare(b.data));
    }

    agruparPorCliente(vendas) {
        const clientes = {};
        vendas.forEach(venda => {
            const cliente = venda.ordemServico?.cliente?.nome || 'Cliente não identificado';
            if (!clientes[cliente]) {
                clientes[cliente] = {
                    cliente,
                    quantidade: 0,
                    valor: 0
                };
            }
            clientes[cliente].quantidade++;
            clientes[cliente].valor += venda.valorPago;
        });
        return Object.values(clientes).sort((a, b) => b.valor - a.valor);
    }

    agruparPorMecanico(servicos) {
        const mecanicos = {};
        servicos.forEach(servico => {
            const mecanico = servico.mecanico?.nome || 'Não atribuído';
            if (!mecanicos[mecanico]) {
                mecanicos[mecanico] = {
                    mecanico,
                    quantidade: 0,
                    valor: 0
                };
            }
            mecanicos[mecanico].quantidade++;
            mecanicos[mecanico].valor += servico.total;
        });
        return Object.values(mecanicos).sort((a, b) => b.valor - a.valor);
    }

    servicosMaisRealizados(servicos) {
        const tipos = {};
        servicos.forEach(servico => {
            const descricao = servico.descricao.substring(0, 50);
            if (!tipos[descricao]) {
                tipos[descricao] = {
                    servico: descricao,
                    quantidade: 0,
                    valor: 0
                };
            }
            tipos[descricao].quantidade++;
            tipos[descricao].valor += servico.total;
        });
        return Object.values(tipos)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 10);
    }

    agruparPorAno(veiculos) {
        const anos = {};
        veiculos.forEach(veiculo => {
            const ano = veiculo.anoModelo || 'Não informado';
            if (!anos[ano]) {
                anos[ano] = {
                    ano,
                    quantidade: 0
                };
            }
            anos[ano].quantidade++;
        });
        return Object.values(anos).sort((a, b) => b.ano - a.ano);
    }

    agruparPorFornecedor(pecas) {
        const fornecedores = {};
        pecas.forEach(peca => {
            const fornecedor = peca.fornecedor?.razaoSocial || 'Não informado';
            if (!fornecedores[fornecedor]) {
                fornecedores[fornecedor] = {
                    fornecedor,
                    quantidade: 0,
                    valor: 0
                };
            }
            fornecedores[fornecedor].quantidade++;
            fornecedores[fornecedor].valor += peca.estoqueAtual * peca.precoCusto;
        });
        return Object.values(fornecedores).sort((a, b) => b.valor - a.valor);
    }

    categorizarClientesPorGasto(clientes) {
        const categorias = {
            'Até R$ 500': 0,
            'R$ 500 - R$ 1.000': 0,
            'R$ 1.000 - R$ 5.000': 0,
            'Acima de R$ 5.000': 0
        };

        clientes.forEach(cliente => {
            if (cliente.totalGasto <= 500) categorias['Até R$ 500']++;
            else if (cliente.totalGasto <= 1000) categorias['R$ 500 - R$ 1.000']++;
            else if (cliente.totalGasto <= 5000) categorias['R$ 1.000 - R$ 5.000']++;
            else categorias['Acima de R$ 5.000']++;
        });

        return Object.entries(categorias).map(([categoria, quantidade]) => ({
            categoria,
            quantidade
        }));
    }

    categorizarClientesPorFrequencia(clientes) {
        const categorias = {
            'Primeira visita': 0,
            'Ocasional (2-3 visitas)': 0,
            'Regular (4-10 visitas)': 0,
            'Fiel (mais de 10 visitas)': 0
        };

        clientes.forEach(cliente => {
            if (cliente.totalOS === 0) categorias['Primeira visita']++;
            else if (cliente.totalOS <= 3) categorias['Ocasional (2-3 visitas)']++;
            else if (cliente.totalOS <= 10) categorias['Regular (4-10 visitas)']++;
            else categorias['Fiel (mais de 10 visitas)']++;
        });

        return Object.entries(categorias).map(([categoria, quantidade]) => ({
            categoria,
            quantidade
        }));
    }

    calcularStatusEstoque(peca) {
        if (peca.estoqueAtual === 0) return 'SEM ESTOQUE';
        if (peca.estoqueMinimo > 0 && peca.estoqueAtual <= peca.estoqueMinimo) return 'BAIXO';
        if (peca.estoqueMaximo > 0 && peca.estoqueAtual >= peca.estoqueMaximo) return 'EXCEDENTE';
        return 'NORMAL';
    }

    async calcularTempoMedioServicos(dataInicio, dataFim) {
        // Implementarei cálculo de tempo médio baseado em dados reais
        // Por enquanto, retornar valor simulado
        return 45; // minutos
    }

    async getVendasPorDia(dias = 7) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);

        const vendas = await prisma.financeiro.groupBy({
            by: ['dataPagamento'],
            where: {
                tipo: 'RECEITA',
                status: 'PAGO',
                dataPagamento: {
                    gte: dataLimite
                }
            },
            _sum: {
                valorPago: true
            }
        });

        const resultado = [];
        for (let i = 0; i < dias; i++) {
            const data = new Date();
            data.setDate(data.getDate() - i);
            const dataStr = data.toISOString().split('T')[0];

            const vendaDia = vendas.find(v =>
                v.dataPagamento.toISOString().split('T')[0] === dataStr
            );

            resultado.unshift({
                data: dataStr,
                valor: vendaDia?._sum.valorPago || 0
            });
        }

        return resultado;
    }

    async getServicosPorTipo(limite = 10) {
        const servicos = await prisma.servicoOS.groupBy({
            by: ['descricao'],
            _count: true,
            _sum: {
                total: true
            },
            orderBy: {
                _count: {
                    descricao: 'desc'
                }
            },
            take: limite
        });

        return servicos.map(s => ({
            descricao: s.descricao.substring(0, 30),
            quantidade: s._count,
            total: s._sum.total || 0
        }));
    }

    async getTopClientes(limite = 5) {
        const clientes = await prisma.cliente.findMany({
            include: {
                ordensServico: {
                    include: {
                        servicos: true,
                        pecas: true
                    }
                }
            }
        });

        const clientesComGasto = clientes.map(cliente => {
            const total = cliente.ordensServico.reduce((acc, os) => {
                const servicos = os.servicos.reduce((sAcc, s) => sAcc + s.total, 0);
                const pecas = os.pecas.reduce((pAcc, p) => pAcc + p.total, 0);
                return acc + servicos + pecas;
            }, 0);

            return {
                nome: cliente.nome,
                total,
                quantidade: cliente.ordensServico.length
            };
        });

        return clientesComGasto
            .sort((a, b) => b.total - a.total)
            .slice(0, limite);
    }
}

module.exports = new RelatoriosService();