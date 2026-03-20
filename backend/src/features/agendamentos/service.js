const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class AgendamentoService {
    // Listar agendamentos com filtros
    async listar(filtros = {}) {
        const {
            page = 1,
            limit = 10,
            dataInicio,
            dataFim,
            clienteId,
            veiculoId,
            mecanicoId,
            status
        } = filtros;
        const skip = (page - 1) * limit;

        const where = {};

        if (dataInicio || dataFim) {
            where.dataHora = {};
            if (dataInicio) where.dataHora.gte = new Date(dataInicio);
            if (dataFim) where.dataHora.lte = new Date(dataFim);
        }

        if (clienteId) where.clienteId = parseInt(clienteId);
        if (veiculoId) where.veiculoId = parseInt(veiculoId);
        if (mecanicoId) where.mecanicoId = parseInt(mecanicoId);
        if (status) where.status = status;

        const [agendamentos, total] = await prisma.$transaction([
            prisma.agendamento.findMany({
                where,
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            telefone1: true,
                            email: true
                        }
                    },
                    veiculo: {
                        select: {
                            id: true,
                            placa: true,
                            marca: true,
                            modelo: true
                        }
                    },
                    mecanico: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    ordemServico: {
                        select: {
                            id: true,
                            numero: true,
                            status: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { dataHora: 'asc' }
            }),
            prisma.agendamento.count({ where })
        ]);

        // Parse dos serviços JSON
        const agendamentosComServicos = agendamentos.map(ag => ({
            ...ag,
            servicos: ag.servicos ? JSON.parse(ag.servicos) : []
        }));

        return {
            data: agendamentosComServicos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar agendamento por ID
    async buscarPorId(id) {
        const agendamento = await prisma.agendamento.findUnique({
            where: { id: parseInt(id) },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone1: true,
                        telefone2: true,
                        email: true,
                        documento: true
                    }
                },
                veiculo: {
                    select: {
                        id: true,
                        placa: true,
                        marca: true,
                        modelo: true,
                        anoModelo: true,
                        cor: true,
                        kmAtual: true
                    }
                },
                mecanico: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                },
                ordemServico: {
                    select: {
                        id: true,
                        numero: true,
                        status: true,
                        dataAbertura: true
                    }
                }
            }
        });

        if (!agendamento) {
            throw new Error('Agendamento não encontrado');
        }

        return {
            ...agendamento,
            servicos: agendamento.servicos ? JSON.parse(agendamento.servicos) : []
        };
    }

    // Buscar agendamentos por período (para calendário)
    async buscarPorPeriodo(dataInicio, dataFim) {
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                dataHora: {
                    gte: new Date(dataInicio),
                    lte: new Date(dataFim)
                }
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
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
                mecanico: {
                    select: {
                        nome: true
                    }
                }
            },
            orderBy: { dataHora: 'asc' }
        });

        return agendamentos.map(ag => ({
            ...ag,
            servicos: ag.servicos ? JSON.parse(ag.servicos) : []
        }));
    }

    // Verificar disponibilidade de horário
    async verificarDisponibilidade(dataHora, mecanicoId = null, duracao = 60) {
        console.log("🔥 SERVICE.verificarDisponibilidade - Parâmetros:", { dataHora, mecanicoId, duracao });

        const data = new Date(dataHora);
        console.log("📅 Data convertida:", data);

        const dataFim = new Date(data.getTime() + duracao * 60000);

        // Verificar se é horário comercial (8h às 18h, segunda a sexta)
        const hora = data.getHours();
        const diaSemana = data.getDay();

        if (hora < 8 || hora >= 18) {
            return {
                disponivel: false,
                motivo: 'Horário fora do expediente (8h às 18h)'
            };
        }

        if (diaSemana === 0) {
            return {
                disponivel: false,
                motivo: 'Não trabalhamos aos domingos'
            };
        }

        // Verificar conflitos
        const where = {
            dataHora: {
                gte: new Date(data.getTime() - duracao * 60000),
                lte: new Date(dataFim.getTime() + duracao * 60000)
            },
            status: {
                notIn: ['CANCELADO', 'CONCLUIDO']
            }
        };

        if (mecanicoId) {
            where.mecanicoId = mecanicoId;
        }

        const conflitos = await prisma.agendamento.count({ where });

        if (conflitos > 0) {
            return {
                disponivel: false,
                motivo: mecanicoId ? 'Mecânico já possui agendamento neste horário' : 'Já existe um agendamento neste horário'
            };
        }

        return {
            disponivel: true,
            motivo: 'Horário disponível'
        };
    }

    // Criar agendamento
    async criar(data) {
        console.log("📥 Data recebida:", data.dataHora);

        // Converter para Date garantindo que é interpretado corretamente
        const dataHora = new Date(data.dataHora);
        console.log("📅 Data após conversão:", dataHora);
        console.log("📅 ISO string:", dataHora.toISOString());

        // Verificar disponibilidade
        console.log("🔍 Verificando disponibilidade para:", dataHora);
        const disponibilidade = await this.verificarDisponibilidade(
            dataHora,
            data.mecanicoId
        );
        console.log("📊 Resultado disponibilidade:", disponibilidade);

        if (!disponibilidade.disponivel) {
            throw new Error(disponibilidade.motivo);
        }

        // Verificar se cliente existe
        console.log("🔍 Verificando cliente ID:", data.clienteId);
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(data.clienteId) }
        });

        if (!cliente) {
            console.log("❌ Cliente não encontrado");
            throw new Error('Cliente não encontrado');
        }
        console.log("✅ Cliente encontrado:", cliente.nome);

        // Verificar se veículo existe e pertence ao cliente
        console.log("🔍 Verificando veículo ID:", data.veiculoId, "para cliente:", data.clienteId);
        const veiculo = await prisma.veiculo.findFirst({
            where: {
                id: parseInt(data.veiculoId),
                clienteId: parseInt(data.clienteId)
            }
        });

        if (!veiculo) {
            console.log("❌ Veículo não encontrado ou não pertence ao cliente");
            throw new Error('Veículo não encontrado ou não pertence ao cliente');
        }
        console.log("✅ Veículo encontrado:", veiculo.placa);

        // Verificar se mecânico existe (se informado)
        if (data.mecanicoId) {
            console.log("🔍 Verificando mecânico ID:", data.mecanicoId);
            const mecanico = await prisma.usuario.findFirst({
                where: {
                    id: parseInt(data.mecanicoId),
                    perfil: {
                        nome: 'MECANICO'
                    }
                }
            });

            if (!mecanico) {
                console.log("❌ Mecânico não encontrado");
                throw new Error('Mecânico não encontrado');
            }
            console.log("✅ Mecânico encontrado:", mecanico.nome);
        }

        // Verificar se servicos é uma string JSON válida
        console.log("🔍 Verificando campo servicos:", data.servicos);
        try {
            JSON.parse(data.servicos);
            console.log("✅ JSON válido");
        } catch (e) {
            console.log("❌ JSON inválido:", e.message);
            throw new Error('Formato de serviços inválido');
        }

        // Criar agendamento
        console.log("📝 Criando agendamento no banco de dados...");
        const agendamento = await prisma.agendamento.create({
            data: {
                dataHora,
                clienteId: parseInt(data.clienteId),
                veiculoId: parseInt(data.veiculoId),
                servicos: data.servicos,
                observacoes: data.observacoes,
                mecanicoId: data.mecanicoId ? parseInt(data.mecanicoId) : null,
                status: 'PENDENTE'
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
                        telefone1: true
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
        });

        console.log("✅ Agendamento criado com sucesso! ID:", agendamento.id);
        logger.info(`Agendamento criado: ID ${agendamento.id} para ${agendamento.cliente.nome}`);

        return {
            ...agendamento,
            servicos: JSON.parse(agendamento.servicos)
        };
    }

    // Atualizar agendamento
    async atualizar(id, data) {
        const agendamento = await prisma.agendamento.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            throw new Error('Agendamento não encontrado');
        }

        // Se estiver alterando data/hora ou mecânico, verificar disponibilidade
        if (data.dataHora || data.mecanicoId) {
            const dataHora = data.dataHora ? new Date(data.dataHora) : agendamento.dataHora;
            const mecanicoId = data.mecanicoId || agendamento.mecanicoId;

            const disponibilidade = await this.verificarDisponibilidade(
                dataHora,
                mecanicoId
            );

            if (!disponibilidade.disponivel) {
                throw new Error(disponibilidade.motivo);
            }
        }

        // Se estiver alterando veículo, verificar se pertence ao cliente
        if (data.veiculoId) {
            const clienteId = data.clienteId || agendamento.clienteId;

            const veiculo = await prisma.veiculo.findFirst({
                where: {
                    id: parseInt(data.veiculoId),
                    clienteId: parseInt(clienteId)
                }
            });

            if (!veiculo) {
                throw new Error('Veículo não encontrado ou não pertence ao cliente');
            }
        }

        const agendamentoAtualizado = await prisma.agendamento.update({
            where: { id: parseInt(id) },
            data: {
                dataHora: data.dataHora ? new Date(data.dataHora) : undefined,
                status: data.status,
                mecanicoId: data.mecanicoId ? parseInt(data.mecanicoId) : undefined,
                observacoes: data.observacoes
            },
            include: {
                cliente: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        logger.info(`Agendamento atualizado: ID ${id}`);

        return {
            ...agendamentoAtualizado,
            servicos: agendamentoAtualizado.servicos ? JSON.parse(agendamentoAtualizado.servicos) : []
        };
    }

    // Deletar agendamento
    async deletar(id) {
        const agendamento = await prisma.agendamento.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            throw new Error('Agendamento não encontrado');
        }

        if (agendamento.ordemServicoId) {
            throw new Error('Não é possível excluir um agendamento que já gerou uma ordem de serviço');
        }

        await prisma.agendamento.delete({
            where: { id: parseInt(id) }
        });

        logger.info(`Agendamento deletado: ID ${id}`);

        return { message: 'Agendamento excluído com sucesso' };
    }

    // Confirmar agendamento
    async confirmar(id) {
        const agendamento = await prisma.agendamento.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            throw new Error('Agendamento não encontrado');
        }

        if (agendamento.status !== 'PENDENTE') {
            throw new Error('Apenas agendamentos pendentes podem ser confirmados');
        }

        const agendamentoConfirmado = await prisma.agendamento.update({
            where: { id: parseInt(id) },
            data: { status: 'CONFIRMADO' }
        });

        logger.info(`Agendamento confirmado: ID ${id}`);

        return agendamentoConfirmado;
    }

    // Cancelar agendamento
    async cancelar(id, motivo = null) {
        const agendamento = await prisma.agendamento.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            throw new Error('Agendamento não encontrado');
        }

        if (agendamento.status === 'CONCLUIDO') {
            throw new Error('Não é possível cancelar um agendamento já concluído');
        }

        if (agendamento.status === 'CANCELADO') {
            throw new Error('Agendamento já está cancelado');
        }

        if (agendamento.ordemServicoId) {
            throw new Error('Não é possível cancelar um agendamento que já gerou uma ordem de serviço');
        }

        const agendamentoCancelado = await prisma.agendamento.update({
            where: { id: parseInt(id) },
            data: {
                status: 'CANCELADO',
                observacoes: motivo ? `${agendamento.observacoes || ''} Cancelado: ${motivo}`.trim() : agendamento.observacoes
            }
        });

        logger.info(`Agendamento cancelado: ID ${id}`);

        return agendamentoCancelado;
    }

    // Buscar próximos agendamentos
    async buscarProximos(limite = 10) {
        const agora = new Date();

        const agendamentos = await prisma.agendamento.findMany({
            where: {
                dataHora: { gte: agora },
                status: { notIn: ['CANCELADO', 'CONCLUIDO'] }
            },
            include: {
                cliente: {
                    select: {
                        nome: true,
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
                mecanico: {
                    select: {
                        nome: true
                    }
                }
            },
            orderBy: { dataHora: 'asc' },
            take: limite
        });

        return agendamentos.map(ag => ({
            ...ag,
            servicos: ag.servicos ? JSON.parse(ag.servicos) : []
        }));
    }

    // Estatísticas
    async getStats() {
        const hoje = new Date();
        const inicioHoje = new Date(hoje.setHours(0, 0, 0, 0));
        const fimHoje = new Date(hoje.setHours(23, 59, 59, 999));

        const [
            totalHoje,
            pendentes,
            confirmados,
            concluidos,
            cancelados
        ] = await Promise.all([
            prisma.agendamento.count({
                where: {
                    dataHora: {
                        gte: inicioHoje,
                        lte: fimHoje
                    }
                }
            }),
            prisma.agendamento.count({
                where: { status: 'PENDENTE' }
            }),
            prisma.agendamento.count({
                where: { status: 'CONFIRMADO' }
            }),
            prisma.agendamento.count({
                where: { status: 'CONCLUIDO' }
            }),
            prisma.agendamento.count({
                where: { status: 'CANCELADO' }
            })
        ]);

        return {
            totalHoje,
            pendentes,
            confirmados,
            concluidos,
            cancelados
        };
    }
}

module.exports = new AgendamentoService();