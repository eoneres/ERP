const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class PerfilService {
    // Listar todos os perfis
    async listar() {
        const perfis = await prisma.perfil.findMany({
            select: {
                id: true,
                nome: true,
                descricao: true,
                permissoes: true,
                _count: {
                    select: {
                        usuarios: true
                    }
                }
            },
            orderBy: { nome: 'asc' }
        });

        return perfis;
    }

    // Buscar perfil por ID
    async buscarPorId(id) {
        const perfil = await prisma.perfil.findUnique({
            where: { id: parseInt(id) },
            include: {
                usuarios: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        ativo: true
                    }
                }
            }
        });

        if (!perfil) {
            throw new Error('Perfil não encontrado');
        }

        return perfil;
    }

    // Criar perfil
    async criar(data) {
        try {
            // Verificar se nome já existe
            const existente = await prisma.perfil.findUnique({
                where: { nome: data.nome.toUpperCase() }
            });

            if (existente) throw new Error('Já existe um perfil com este nome');

            const perfil = await prisma.perfil.create({
                data: {
                    nome: data.nome.toUpperCase(),
                    descricao: data.descricao,
                    permissoes: data.permissoes ? JSON.stringify(data.permissoes) : null
                }
            });

            logger.info(`Perfil criado: ${perfil.nome}`);
            return perfil;
        } catch (error) {
            console.error('Erro em criarPerfil:', error);
            throw error;
        }
    }

    // Atualizar perfil
    async atualizar(id, data) {
        try {
            const perfil = await prisma.perfil.findUnique({
                where: { id: parseInt(id) }
            });

            if (!perfil) throw new Error('Perfil não encontrado');

            // Se estiver alterando nome, verificar se já existe
            if (data.nome && data.nome.toUpperCase() !== perfil.nome) {
                const existente = await prisma.perfil.findUnique({
                    where: { nome: data.nome.toUpperCase() }
                });
                if (existente) throw new Error('Já existe um perfil com este nome');
            }

            const updateData = {
                nome: data.nome ? data.nome.toUpperCase() : undefined,
                descricao: data.descricao,
                permissoes: data.permissoes ? JSON.stringify(data.permissoes) : undefined
            };

            const perfilAtualizado = await prisma.perfil.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            logger.info(`Perfil atualizado: ${perfilAtualizado.nome}`);
            return perfilAtualizado;
        } catch (error) {
            console.error('Erro em atualizarPerfil:', error);
            throw error;
        }
    }

    // Deletar perfil
    async deletar(id) {
        const perfil = await prisma.perfil.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { usuarios: true }
                }
            }
        });

        if (!perfil) {
            throw new Error('Perfil não encontrado');
        }

        // Verificar se existem usuários com este perfil
        if (perfil._count.usuarios > 0) {
            throw new Error('Não é possível excluir um perfil que possui usuários vinculados');
        }

        // Não permitir excluir perfis padrão
        const perfisProtegidos = ['ADMIN', 'ATENDENTE', 'MECANICO'];
        if (perfisProtegidos.includes(perfil.nome)) {
            throw new Error('Não é possível excluir perfis padrão do sistema');
        }

        await prisma.perfil.delete({
            where: { id: parseInt(id) }
        });

        logger.info(`Perfil deletado: ${perfil.nome}`);
    }

    // Permissões padrão para cada perfil
    getDefaultPermissions(perfilNome) {
        const permissoes = {
            ADMIN: {
                dashboard: ['view', 'export'],
                clientes: ['create', 'read', 'update', 'delete'],
                veiculos: ['create', 'read', 'update', 'delete'],
                agendamentos: ['create', 'read', 'update', 'delete'],
                os: ['create', 'read', 'update', 'delete', 'approve'],
                estoque: ['create', 'read', 'update', 'delete'],
                financeiro: ['create', 'read', 'update', 'delete'],
                usuarios: ['create', 'read', 'update', 'delete'],
                relatorios: ['view', 'export'],
                configuracoes: ['view', 'edit']
            },
            ATENDENTE: {
                dashboard: ['view'],
                clientes: ['create', 'read', 'update'],
                veiculos: ['create', 'read', 'update'],
                agendamentos: ['create', 'read', 'update'],
                os: ['create', 'read'],
                estoque: ['read'],
                financeiro: ['read'],
                relatorios: ['view']
            },
            MECANICO: {
                dashboard: ['view'],
                clientes: ['read'],
                veiculos: ['read'],
                agendamentos: ['read'],
                os: ['read', 'update'],
                estoque: ['read']
            }
        };

        return permissoes[perfilNome] || {};
    }

    // Inicializar perfis padrão (para ser usado no seed)
    async inicializarPerfisPadrao() {
        const perfis = ['ADMIN', 'ATENDENTE', 'MECANICO'];

        for (const perfilNome of perfis) {
            const existente = await prisma.perfil.findUnique({
                where: { nome: perfilNome }
            });

            if (!existente) {
                await prisma.perfil.create({
                    data: {
                        nome: perfilNome,
                        descricao: this.getDescricaoPerfil(perfilNome),
                        permissoes: this.getDefaultPermissions(perfilNome)
                    }
                });
                logger.info(`Perfil padrão criado: ${perfilNome}`);
            }
        }
    }

    getDescricaoPerfil(perfilNome) {
        const descricoes = {
            ADMIN: 'Acesso total ao sistema',
            ATENDENTE: 'Atendimento ao cliente e agendamentos',
            MECANICO: 'Execução de serviços e ordens de serviço'
        };
        return descricoes[perfilNome] || '';
    }
}

module.exports = new PerfilService();