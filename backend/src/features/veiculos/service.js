const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class VeiculoService {
    // Listar veículos com filtros
    async listar(filtros = {}) {
        const { page = 1, limit = 10, search, clienteId, marca, ativo } = filtros;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.OR = [
                { placa: { contains: search, mode: 'insensitive' } },
                { marca: { contains: search, mode: 'insensitive' } },
                { modelo: { contains: search, mode: 'insensitive' } },
                { chassi: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (clienteId) {
            where.clienteId = parseInt(clienteId);
        }

        if (marca) {
            where.marca = { contains: marca, mode: 'insensitive' };
        }

        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }

        const [veiculos, total] = await prisma.$transaction([
            prisma.veiculo.findMany({
                where,
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            documento: true,
                            telefone1: true
                        }
                    },
                    _count: {
                        select: {
                            ordensServico: true,
                            agendamentos: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: [
                    { ativo: 'desc' },
                    { createdAt: 'desc' }
                ]
            }),
            prisma.veiculo.count({ where })
        ]);

        return {
            data: veiculos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar veículo por ID
    async buscarPorId(id) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: parseInt(id) },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        documento: true,
                        telefone1: true,
                        email: true
                    }
                },
                ordensServico: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        numero: true,
                        status: true,
                        dataAbertura: true,
                        dataFechamento: true,
                        kmEntrada: true,
                        kmSaida: true,
                        servicos: {
                            select: {
                                descricao: true,
                                valorUnitario: true,
                                status: true
                            }
                        }
                    }
                },
                agendamentos: {
                    take: 5,
                    orderBy: { dataHora: 'desc' },
                    select: {
                        id: true,
                        dataHora: true,
                        status: true,
                        servicos: true
                    }
                }
            }
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado');
        }

        return veiculo;
    }

    // Buscar veículo por placa
    async buscarPorPlaca(placa) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { placa: placa.toUpperCase() },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone1: true
                    }
                }
            }
        });

        return veiculo;
    }

    // Buscar veículos por cliente
    async buscarPorCliente(clienteId) {
        const veiculos = await prisma.veiculo.findMany({
            where: {
                clienteId: parseInt(clienteId),
                ativo: true
            },
            include: {
                _count: {
                    select: {
                        ordensServico: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });

        return veiculos;
    }

    // Criar veículo
    async criar(data) {
        // Verificar se placa já existe
        const placaExistente = await prisma.veiculo.findUnique({
            where: { placa: data.placa.toUpperCase() }
        });

        if (placaExistente) {
            throw new Error('Placa já cadastrada');
        }

        // Verificar se cliente existe
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(data.clienteId) }
        });

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        // Verificar se chassi já existe (se informado)
        if (data.chassi) {
            const chassiExistente = await prisma.veiculo.findFirst({
                where: { chassi: data.chassi.toUpperCase() }
            });

            if (chassiExistente) {
                throw new Error('Chassi já cadastrado');
            }
        }

        // Verificar se renavam já existe (se informado)
        if (data.renavam) {
            const renavamExistente = await prisma.veiculo.findFirst({
                where: { renavam: data.renavam }
            });

            if (renavamExistente) {
                throw new Error('RENAVAM já cadastrado');
            }
        }

        // Criar veículo
        const veiculo = await prisma.veiculo.create({
            data: {
                placa: data.placa.toUpperCase(),
                renavam: data.renavam,
                chassi: data.chassi?.toUpperCase(),
                marca: data.marca,
                modelo: data.modelo,
                anoFabricacao: parseInt(data.anoFabricacao),
                anoModelo: parseInt(data.anoModelo),
                cor: data.cor,
                combustivel: data.combustivel,
                cambio: data.cambio,
                kmAtual: data.kmAtual || 0,
                clienteId: parseInt(data.clienteId),
                observacoes: data.observacoes,
                ativo: data.ativo !== undefined ? data.ativo : true
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone1: true
                    }
                }
            }
        });

        logger.info(`Veículo criado: ${veiculo.placa} para cliente ID: ${veiculo.clienteId}`);

        return veiculo;
    }

    // Atualizar veículo
    async atualizar(id, data) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: parseInt(id) }
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado');
        }

        // Se estiver alterando placa, verificar se já existe
        if (data.placa && data.placa.toUpperCase() !== veiculo.placa) {
            const placaExistente = await prisma.veiculo.findUnique({
                where: { placa: data.placa.toUpperCase() }
            });

            if (placaExistente) {
                throw new Error('Placa já cadastrada');
            }
        }

        // Se estiver alterando chassi, verificar se já existe
        if (data.chassi && data.chassi.toUpperCase() !== veiculo.chassi) {
            const chassiExistente = await prisma.veiculo.findFirst({
                where: {
                    chassi: data.chassi.toUpperCase(),
                    NOT: { id: parseInt(id) }
                }
            });

            if (chassiExistente) {
                throw new Error('Chassi já cadastrado');
            }
        }

        // Se estiver alterando renavam, verificar se já existe
        if (data.renavam && data.renavam !== veiculo.renavam) {
            const renavamExistente = await prisma.veiculo.findFirst({
                where: {
                    renavam: data.renavam,
                    NOT: { id: parseInt(id) }
                }
            });

            if (renavamExistente) {
                throw new Error('RENAVAM já cadastrado');
            }
        }

        // Se estiver alterando cliente, verificar se existe
        if (data.clienteId) {
            const cliente = await prisma.cliente.findUnique({
                where: { id: parseInt(data.clienteId) }
            });

            if (!cliente) {
                throw new Error('Cliente não encontrado');
            }
        }

        // Preparar dados para atualização
        const updateData = {
            ...data,
            placa: data.placa?.toUpperCase(),
            chassi: data.chassi?.toUpperCase(),
            clienteId: data.clienteId ? parseInt(data.clienteId) : undefined,
            anoFabricacao: data.anoFabricacao ? parseInt(data.anoFabricacao) : undefined,
            anoModelo: data.anoModelo ? parseInt(data.anoModelo) : undefined
        };

        const veiculoAtualizado = await prisma.veiculo.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                cliente: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        logger.info(`Veículo atualizado: ${veiculoAtualizado.placa}`);

        return veiculoAtualizado;
    }

    // Deletar veículo (soft delete)
    async deletar(id) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: parseInt(id) }
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado');
        }

        // Verificar se veículo tem ordens de serviço em andamento
        const osEmAndamento = await prisma.ordemServico.count({
            where: {
                veiculoId: parseInt(id),
                status: { notIn: ['ENTREGUE', 'CANCELADA'] }
            }
        });

        if (osEmAndamento > 0) {
            throw new Error('Veículo possui ordens de serviço em andamento');
        }

        // Soft delete
        await prisma.veiculo.update({
            where: { id: parseInt(id) },
            data: { ativo: false }
        });

        logger.info(`Veículo desativado: ${veiculo.placa}`);

        return { message: 'Veículo desativado com sucesso' };
    }

    // Ativar/Desativar veículo
    async toggleStatus(id) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: parseInt(id) }
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado');
        }

        const novoStatus = !veiculo.ativo;

        await prisma.veiculo.update({
            where: { id: parseInt(id) },
            data: { ativo: novoStatus }
        });

        logger.info(`Veículo ${novoStatus ? 'ativado' : 'desativado'}: ${veiculo.placa}`);

        return {
            message: `Veículo ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
            ativo: novoStatus
        };
    }

    // Atualizar quilometragem
    async atualizarKm(id, kmAtual, observacao) {
        const veiculo = await prisma.veiculo.findUnique({
            where: { id: parseInt(id) }
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado');
        }

        // Validar se km não é menor que o anterior
        if (kmAtual < veiculo.kmAtual) {
            throw new Error('Quilometragem não pode ser menor que a anterior');
        }

        const veiculoAtualizado = await prisma.veiculo.update({
            where: { id: parseInt(id) },
            data: { kmAtual }
        });

        // Registrar histórico de km (opcional)
        if (observacao) {
            await prisma.historicoKm.create({
                data: {
                    veiculoId: parseInt(id),
                    kmAnterior: veiculo.kmAtual,
                    kmNovo: kmAtual,
                    observacao,
                    dataRegistro: new Date()
                }
            });
        }

        logger.info(`KM atualizado para veículo ${veiculo.placa}: ${kmAtual}`);

        return veiculoAtualizado;
    }

    // Buscar histórico de serviços do veículo
    async historicoServicos(id) {
        const historico = await prisma.ordemServico.findMany({
            where: {
                veiculoId: parseInt(id),
                status: 'ENTREGUE'
            },
            orderBy: { dataFechamento: 'desc' },
            include: {
                servicos: {
                    select: {
                        descricao: true,
                        valorUnitario: true,
                        status: true
                    }
                },
                mecanico: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        return historico;
    }

    // Estatísticas do veículo
    async getStats(id) {
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);

        const [totalOS, totalGasto, ultimaOS] = await Promise.all([
            // Total de OS do veículo
            prisma.ordemServico.count({
                where: {
                    veiculoId: parseInt(id),
                    status: 'ENTREGUE'
                }
            }),

            // Total gasto em serviços
            prisma.ordemServico.aggregate({
                where: {
                    veiculoId: parseInt(id),
                    status: 'ENTREGUE',
                    dataFechamento: { gte: inicioAno }
                },
                _sum: {
                    // Isso precisará ser ajustado conforme seu modelo
                }
            }),

            // Última OS
            prisma.ordemServico.findFirst({
                where: { veiculoId: parseInt(id) },
                orderBy: { dataFechamento: 'desc' },
                select: {
                    numero: true,
                    dataFechamento: true,
                    kmSaida: true
                }
            })
        ]);

        return {
            totalOS,
            ultimaOS,
            kmAtual: (await prisma.veiculo.findUnique({
                where: { id: parseInt(id) },
                select: { kmAtual: true }
            })).kmAtual
        };
    }
}

module.exports = new VeiculoService();