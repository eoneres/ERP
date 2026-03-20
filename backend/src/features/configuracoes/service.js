const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class ConfiguracoesService {
    constructor() {
        this.configPath = path.join(__dirname, '../../../config');
        this.backupPath = path.join(__dirname, '../../../backups');

        // Criar diretórios se não existirem
        if (!fs.existsSync(this.configPath)) {
            fs.mkdirSync(this.configPath, { recursive: true });
        }
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }

    // ==================== CONFIGURAÇÕES DA EMPRESA ====================

    async getConfiguracoesEmpresa() {
        const configPath = path.join(this.configPath, 'empresa.json');

        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }

        // Configurações padrão
        const defaultConfig = {
            nome: 'Oficina Mecânica',
            razaoSocial: 'Oficina Mecânica Ltda',
            cnpj: '',
            ie: '',
            im: '',
            telefone1: '',
            telefone2: '',
            email: '',
            website: '',
            cep: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
            logo: '',
            observacoes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return defaultConfig;
    }

    async atualizarConfiguracoesEmpresa(dados) {
        const configPath = path.join(this.configPath, 'empresa.json');

        // Buscar configurações atuais
        const configAtual = await this.getConfiguracoesEmpresa();

        // Mesclar dados
        const novaConfig = {
            ...configAtual,
            ...dados,
            updatedAt: new Date().toISOString()
        };

        // Salvar arquivo
        fs.writeFileSync(configPath, JSON.stringify(novaConfig, null, 2));

        logger.info('Configurações da empresa atualizadas');

        return novaConfig;
    }

    // ==================== CONFIGURAÇÕES GERAIS ====================

    async getConfiguracoesGerais() {
        const configPath = path.join(this.configPath, 'gerais.json');

        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }

        // Configurações padrão
        const defaultConfig = {
            horarioFuncionamento: {
                inicio: '08:00',
                fim: '18:00'
            },
            diasFuncionamento: [1, 2, 3, 4, 5], // Segunda a sexta
            tempoPadraoAgendamento: 60, // minutos
            permiteAgendamentoOnline: true,
            notificacoes: {
                email: true,
                whatsapp: false,
                sms: false
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return defaultConfig;
    }

    async atualizarConfiguracoesGerais(dados) {
        const configPath = path.join(this.configPath, 'gerais.json');

        const configAtual = await this.getConfiguracoesGerais();

        const novaConfig = {
            ...configAtual,
            ...dados,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(configPath, JSON.stringify(novaConfig, null, 2));

        logger.info('Configurações gerais atualizadas');

        return novaConfig;
    }

    // ==================== CONFIGURAÇÕES FINANCEIRAS ====================

    async getConfiguracoesFinanceiras() {
        const configPath = path.join(this.configPath, 'financeiras.json');

        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }

        // Configurações padrão
        const defaultConfig = {
            formaPagamentoPadrao: 'DINHEIRO',
            prazoMedioRecebimento: 30,
            prazoMedioPagamento: 30,
            jurosMensal: 1.5,
            multaAtraso: 2,
            descontoMaximo: 10,
            carenciaDesconto: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return defaultConfig;
    }

    async atualizarConfiguracoesFinanceiras(dados) {
        const configPath = path.join(this.configPath, 'financeiras.json');

        const configAtual = await this.getConfiguracoesFinanceiras();

        const novaConfig = {
            ...configAtual,
            ...dados,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(configPath, JSON.stringify(novaConfig, null, 2));

        logger.info('Configurações financeiras atualizadas');

        return novaConfig;
    }

    // ==================== PERFIS E PERMISSÕES ====================

    async listarPerfis() {
        const perfis = await prisma.perfil.findMany({
            include: {
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

    async buscarPerfilPorId(id) {
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

    async criarPerfil(dados) {
        // Verificar se nome já existe
        const existente = await prisma.perfil.findUnique({
            where: { nome: dados.nome.toUpperCase() }
        });

        if (existente) {
            throw new Error('Já existe um perfil com este nome');
        }

        // Validar estrutura das permissões
        this.validarPermissoes(dados.permissoes);

        const perfil = await prisma.perfil.create({
            data: {
                nome: dados.nome.toUpperCase(),
                descricao: dados.descricao,
                permissoes: dados.permissoes
            }
        });

        logger.info(`Perfil criado: ${perfil.nome}`);

        return perfil;
    }

    async atualizarPerfil(id, dados) {
        const perfil = await prisma.perfil.findUnique({
            where: { id: parseInt(id) }
        });

        if (!perfil) {
            throw new Error('Perfil não encontrado');
        }

        // Se estiver alterando nome, verificar se já existe
        if (dados.nome && dados.nome.toUpperCase() !== perfil.nome) {
            const existente = await prisma.perfil.findUnique({
                where: { nome: dados.nome.toUpperCase() }
            });

            if (existente) {
                throw new Error('Já existe um perfil com este nome');
            }
        }

        // Validar permissões se foram alteradas
        if (dados.permissoes) {
            this.validarPermissoes(dados.permissoes);
        }

        // Não permitir alterar perfis padrão
        const perfisProtegidos = ['ADMIN', 'ATENDENTE', 'MECANICO'];
        if (perfisProtegidos.includes(perfil.nome) && dados.nome && dados.nome !== perfil.nome) {
            throw new Error('Não é possível alterar o nome de perfis padrão do sistema');
        }

        const perfilAtualizado = await prisma.perfil.update({
            where: { id: parseInt(id) },
            data: {
                nome: dados.nome?.toUpperCase(),
                descricao: dados.descricao,
                permissoes: dados.permissoes
            }
        });

        logger.info(`Perfil atualizado: ${perfilAtualizado.nome}`);

        return perfilAtualizado;
    }

    async deletarPerfil(id) {
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

        // Não permitir excluir perfis padrão
        const perfisProtegidos = ['ADMIN', 'ATENDENTE', 'MECANICO'];
        if (perfisProtegidos.includes(perfil.nome)) {
            throw new Error('Não é possível excluir perfis padrão do sistema');
        }

        // Verificar se existem usuários com este perfil
        if (perfil._count.usuarios > 0) {
            throw new Error('Não é possível excluir um perfil que possui usuários vinculados');
        }

        await prisma.perfil.delete({
            where: { id: parseInt(id) }
        });

        logger.info(`Perfil deletado: ${perfil.nome}`);

        return { message: 'Perfil excluído com sucesso' };
    }

    validarPermissoes(permissoes) {
        const modulosPermitidos = [
            'dashboard', 'clientes', 'veiculos', 'agendamentos',
            'os', 'estoque', 'financeiro', 'relatorios', 'configuracoes'
        ];

        const acoesPermitidas = ['view', 'create', 'edit', 'delete', 'export', 'approve'];

        for (const [modulo, acoes] of Object.entries(permissoes)) {
            if (!modulosPermitidos.includes(modulo)) {
                throw new Error(`Módulo inválido: ${modulo}`);
            }

            if (!Array.isArray(acoes)) {
                throw new Error(`Permissões para ${modulo} devem ser um array`);
            }

            for (const acao of acoes) {
                if (!acoesPermitidas.includes(acao)) {
                    throw new Error(`Ação inválida para ${modulo}: ${acao}`);
                }
            }
        }
    }

    // ==================== USUÁRIOS ====================

    async listarUsuarios(filtros = {}) {
        const { page = 1, limit = 10, search, perfilId, ativo } = filtros;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (perfilId) where.perfilId = parseInt(perfilId);
        if (ativo !== undefined) where.ativo = ativo === 'true';

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

    async buscarUsuarioPorId(id) {
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
                perfil: {
                    select: {
                        id: true,
                        nome: true,
                        permissoes: true
                    }
                }
            }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        return usuario;
    }

    async criarUsuario(dados) {
        const bcrypt = require('bcrypt');

        // Verificar se e-mail já existe
        const existente = await prisma.usuario.findUnique({
            where: { email: dados.email }
        });

        if (existente) {
            throw new Error('E-mail já cadastrado');
        }

        // Verificar se perfil existe
        const perfil = await prisma.perfil.findUnique({
            where: { id: parseInt(dados.perfilId) }
        });

        if (!perfil) {
            throw new Error('Perfil não encontrado');
        }

        const senhaHash = await bcrypt.hash(dados.senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                senha: senhaHash,
                telefone: dados.telefone,
                perfilId: parseInt(dados.perfilId),
                ativo: true
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

        logger.info(`Usuário criado: ${usuario.nome}`);

        return usuario;
    }

    async atualizarUsuario(id, dados) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Se estiver alterando e-mail, verificar se já existe
        if (dados.email && dados.email !== usuario.email) {
            const existente = await prisma.usuario.findUnique({
                where: { email: dados.email }
            });

            if (existente) {
                throw new Error('E-mail já cadastrado por outro usuário');
            }
        }

        // Se estiver alterando perfil, verificar se existe
        if (dados.perfilId) {
            const perfil = await prisma.perfil.findUnique({
                where: { id: parseInt(dados.perfilId) }
            });

            if (!perfil) {
                throw new Error('Perfil não encontrado');
            }
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {
                nome: dados.nome,
                email: dados.email,
                telefone: dados.telefone,
                perfilId: dados.perfilId ? parseInt(dados.perfilId) : undefined,
                ativo: dados.ativo
            },
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

        logger.info(`Usuário atualizado: ${usuarioAtualizado.nome}`);

        return usuarioAtualizado;
    }

    async deletarUsuario(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Não permitir deletar o último admin
        if (usuario.perfilId === 1) { // Assumindo que ADMIN tem ID 1
            const adminCount = await prisma.usuario.count({
                where: { perfilId: 1 }
            });

            if (adminCount <= 1) {
                throw new Error('Não é possível excluir o último administrador do sistema');
            }
        }

        // Soft delete
        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { ativo: false }
        });

        logger.info(`Usuário desativado: ${usuario.nome}`);

        return { message: 'Usuário desativado com sucesso' };
    }

    // ==================== BACKUP ====================

    async getConfiguracoesBackup() {
        const configPath = path.join(this.configPath, 'backup.json');

        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }

        // Configurações padrão
        const defaultConfig = {
            ativo: false,
            frequencia: 'DIARIO',
            horario: '23:00',
            diasSemana: [1, 2, 3, 4, 5], // Segunda a sexta
            manterBackups: 7,
            local: 'LOCAL',
            ultimoBackup: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return defaultConfig;
    }

    async atualizarConfiguracoesBackup(dados) {
        const configPath = path.join(this.configPath, 'backup.json');

        const configAtual = await this.getConfiguracoesBackup();

        const novaConfig = {
            ...configAtual,
            ...dados,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(configPath, JSON.stringify(novaConfig, null, 2));

        logger.info('Configurações de backup atualizadas');

        return novaConfig;
    }

    async realizarBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sqlite`;
        const backupPath = path.join(this.backupPath, filename);

        try {
            const dbPath = path.join(__dirname, '../../../prisma/dev.db');

            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, backupPath);

                // Atualizar data do último backup
                const configPath = path.join(this.configPath, 'backup.json');
                if (fs.existsSync(configPath)) {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    config.ultimoBackup = new Date().toISOString();
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                }

                // Limpar backups antigos
                await this.limparBackupsAntigos();

                logger.info(`Backup realizado: ${filename}`);

                return {
                    success: true,
                    filename,
                    path: backupPath,
                    size: fs.statSync(backupPath).size
                };
            } else {
                throw new Error('Arquivo de banco de dados não encontrado');
            }
        } catch (error) {
            logger.error('Erro ao realizar backup:', error);
            throw new Error('Erro ao realizar backup');
        }
    }

    async listarBackups() {
        const files = fs.readdirSync(this.backupPath);

        const backups = files
            .filter(file => file.endsWith('.sqlite'))
            .map(file => {
                const filePath = path.join(this.backupPath, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);

        return backups;
    }

    async restaurarBackup(filename) {
        const backupPath = path.join(this.backupPath, filename);
        const dbPath = path.join(__dirname, '../../../prisma/dev.db');

        if (!fs.existsSync(backupPath)) {
            throw new Error('Arquivo de backup não encontrado');
        }

        try {
            // Fazer backup automático antes de restaurar
            await this.realizarBackup();

            // Restaurar backup
            fs.copyFileSync(backupPath, dbPath);

            logger.info(`Backup restaurado: ${filename}`);

            return { success: true, message: 'Backup restaurado com sucesso' };
        } catch (error) {
            logger.error('Erro ao restaurar backup:', error);
            throw new Error('Erro ao restaurar backup');
        }
    }

    async limparBackupsAntigos() {
        const config = await this.getConfiguracoesBackup();
        const manter = config.manterBackups || 7;

        const backups = await this.listarBackups();

        if (backups.length > manter) {
            const backupsParaRemover = backups.slice(manter);

            for (const backup of backupsParaRemover) {
                const filePath = path.join(this.backupPath, backup.filename);
                fs.unlinkSync(filePath);
                logger.info(`Backup antigo removido: ${backup.filename}`);
            }
        }
    }

    // ==================== AUDITORIA ====================

    async getLogsAuditoria(filtros = {}) {
        const { page = 1, limit = 50, usuarioId, acao, dataInicio, dataFim } = filtros;
        const skip = (page - 1) * limit;

        // Buscar logs do arquivo
        const logPath = path.join(__dirname, '../../../logs/combined.log');

        if (!fs.existsSync(logPath)) {
            return {
                data: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            };
        }

        const logs = fs.readFileSync(logPath, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    // Formato: timestamp level: message
                    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d{3}) (\w+): (.+)$/);
                    if (match) {
                        return {
                            timestamp: match[1],
                            level: match[2],
                            message: match[3]
                        };
                    }
                } catch (e) {
                    return null;
                }
                return null;
            })
            .filter(log => log !== null)
            .reverse(); // Mais recentes primeiro

        // Aplicar filtros
        let logsFiltrados = logs;

        if (dataInicio) {
            const inicio = new Date(dataInicio);
            logsFiltrados = logsFiltrados.filter(log => new Date(log.timestamp) >= inicio);
        }

        if (dataFim) {
            const fim = new Date(dataFim);
            logsFiltrados = logsFiltrados.filter(log => new Date(log.timestamp) <= fim);
        }

        if (acao) {
            logsFiltrados = logsFiltrados.filter(log =>
                log.message.toLowerCase().includes(acao.toLowerCase())
            );
        }

        // Paginação
        const total = logsFiltrados.length;
        const paginatedLogs = logsFiltrados.slice(skip, skip + parseInt(limit));

        return {
            data: paginatedLogs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new ConfiguracoesService();