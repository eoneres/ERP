const prisma = require('../../config/database');
const bcrypt = require('bcrypt');
const logger = require('../../utils/logger');

class UsuarioService {
    // Listar usuários com filtros
    async listar(filtros = {}) {
        const { page = 1, limit = 10, search, perfilId, ativo } = filtros;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (perfilId) {
            where.perfilId = parseInt(perfilId);
        }

        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }

        const [usuarios, total] = await prisma.$transaction([
            prisma.usuario.findMany({
                where,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                    ultimoAcesso: true,
                    createdAt: true,
                    perfil: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    _count: {
                        select: {
                            // Nomes corretos das relações
                            ordensServicoMecanico: true,
                            agendamentosMecanico: true,
                            movimentacoes: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { nome: 'asc' }
            }),
            prisma.usuario.count({ where })
        ]);

        return {
            data: usuarios,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar usuário por ID (com detalhes)
    async buscarPorId(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                ativo: true,
                ultimoAcesso: true,
                createdAt: true,
                updatedAt: true,
                perfil: {
                    select: {
                        id: true,
                        nome: true,
                        descricao: true,
                        permissoes: true
                    }
                },
                // OS onde atuou como mecânico
                ordensServicoMecanico: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        numero: true,
                        status: true,
                        createdAt: true,
                        cliente: {
                            select: { nome: true }
                        },
                        veiculo: {
                            select: { placa: true, modelo: true }
                        }
                    }
                },
                // Agendamentos onde é o mecânico
                agendamentosMecanico: {
                    take: 10,
                    orderBy: { dataHora: 'desc' },
                    select: {
                        id: true,
                        dataHora: true,
                        status: true,
                        cliente: {
                            select: { nome: true }
                        }
                    }
                },
                // Movimentações de estoque
                movimentacoes: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        tipo: true,
                        quantidade: true,
                        createdAt: true,
                        peca: {
                            select: { descricao: true }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        return usuario;
    }

    // Criar usuário
    async criar(data) {
        // Verificar se e-mail já existe
        const existente = await prisma.usuario.findUnique({
            where: { email: data.email }
        });

        if (existente) {
            throw new Error('E-mail já cadastrado');
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(data.senha, 10);

        // Criar usuário
        const usuario = await prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: senhaHash,
                telefone: data.telefone,
                perfilId: parseInt(data.perfilId),
                ativo: data.ativo !== undefined ? data.ativo : true
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                ativo: true,
                createdAt: true,
                perfil: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        logger.info(`Usuário criado: ${usuario.nome} (ID: ${usuario.id})`);

        return usuario;
    }

    // Atualizar usuário
    async atualizar(id, data) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Se estiver alterando e-mail, verificar se já existe
        if (data.email && data.email !== usuario.email) {
            const existente = await prisma.usuario.findUnique({
                where: { email: data.email }
            });

            if (existente) {
                throw new Error('E-mail já cadastrado por outro usuário');
            }
        }

        // Preparar dados para atualização
        const updateData = { ...data };
        delete updateData.senha; // Não atualizar senha por aqui (tem rota específica)
        delete updateData.id;

        if (data.perfilId) {
            updateData.perfilId = parseInt(data.perfilId);
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                ativo: true,
                updatedAt: true,
                perfil: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        logger.info(`Usuário atualizado: ${usuarioAtualizado.nome} (ID: ${id})`);

        return usuarioAtualizado;
    }

    // Deletar usuário (soft delete)
    async deletar(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar se usuário tem ordens de serviço em andamento
        const osEmAndamento = await prisma.ordemServico.count({
            where: {
                mecanicoResponsavelId: parseInt(id),
                status: { notIn: ['CONCLUIDA', 'ENTREGUE', 'CANCELADA'] }
            }
        });

        if (osEmAndamento > 0) {
            throw new Error('Usuário possui ordens de serviço em andamento');
        }

        // Soft delete (apenas desativa)
        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { ativo: false }
        });

        // Revogar todos os refresh tokens
        await prisma.refreshToken.updateMany({
            where: { usuarioId: parseInt(id) },
            data: { revogado: true }
        });

        logger.info(`Usuário desativado: ${usuario.nome} (ID: ${id})`);

        return { message: 'Usuário desativado com sucesso' };
    }

    // Ativar/Desativar usuário
    async toggleStatus(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        const novoStatus = !usuario.ativo;

        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { ativo: novoStatus }
        });

        if (!novoStatus) {
            // Se desativar, revogar tokens
            await prisma.refreshToken.updateMany({
                where: { usuarioId: parseInt(id) },
                data: { revogado: true }
            });
        }

        logger.info(`Usuário ${novoStatus ? 'ativado' : 'desativado'}: ${usuario.nome}`);

        return {
            message: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
            ativo: novoStatus
        };
    }

    // Buscar estatísticas do usuário
    async getStats(id) {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        const [osConcluidas, agendamentosHoje, movimentacoesMes] = await Promise.all([
            // OS concluídas no mês
            prisma.ordemServico.count({
                where: {
                    mecanicoResponsavelId: parseInt(id),
                    status: 'CONCLUIDA',
                    dataFechamento: { gte: inicioMes }
                }
            }),
            // Agendamentos para hoje
            prisma.agendamento.count({
                where: {
                    mecanicoId: parseInt(id),
                    dataHora: {
                        gte: new Date(hoje.setHours(0, 0, 0, 0)),
                        lt: new Date(hoje.setHours(23, 59, 59, 999))
                    }
                }
            }),
            // Movimentações de estoque no mês
            prisma.movimentacaoEstoque.count({
                where: {
                    usuarioId: parseInt(id),
                    createdAt: { gte: inicioMes }
                }
            })
        ]);

        return {
            osConcluidas,
            agendamentosHoje,
            movimentacoesMes,
            ultimoAcesso: (await prisma.usuario.findUnique({
                where: { id: parseInt(id) },
                select: { ultimoAcesso: true }
            })).ultimoAcesso
        };
    }
}

module.exports = new UsuarioService();