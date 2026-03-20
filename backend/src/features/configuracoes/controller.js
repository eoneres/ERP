const configuracoesService = require('./service');
const logger = require('../../utils/logger');

class ConfiguracoesController {
    // ==================== CONFIGURAÇÕES DA EMPRESA ====================

    async getConfiguracoesEmpresa(req, res, next) {
        try {
            const config = await configuracoesService.getConfiguracoesEmpresa();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracoesEmpresa(req, res, next) {
        try {
            const config = await configuracoesService.atualizarConfiguracoesEmpresa(req.body);

            res.json({
                success: true,
                message: 'Configurações da empresa atualizadas com sucesso',
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== CONFIGURAÇÕES GERAIS ====================

    async getConfiguracoesGerais(req, res, next) {
        try {
            const config = await configuracoesService.getConfiguracoesGerais();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracoesGerais(req, res, next) {
        try {
            const config = await configuracoesService.atualizarConfiguracoesGerais(req.body);

            res.json({
                success: true,
                message: 'Configurações gerais atualizadas com sucesso',
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== CONFIGURAÇÕES FINANCEIRAS ====================

    async getConfiguracoesFinanceiras(req, res, next) {
        try {
            const config = await configuracoesService.getConfiguracoesFinanceiras();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracoesFinanceiras(req, res, next) {
        try {
            const config = await configuracoesService.atualizarConfiguracoesFinanceiras(req.body);

            res.json({
                success: true,
                message: 'Configurações financeiras atualizadas com sucesso',
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== PERFIS ====================

    async listarPerfis(req, res, next) {
        try {
            const perfis = await configuracoesService.listarPerfis();

            res.json({
                success: true,
                data: perfis
            });
        } catch (error) {
            next(error);
        }
    }

    async buscarPerfilPorId(req, res, next) {
        try {
            const { id } = req.params;
            const perfil = await configuracoesService.buscarPerfilPorId(id);

            res.json({
                success: true,
                data: perfil
            });
        } catch (error) {
            if (error.message === 'Perfil não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async criarPerfil(req, res, next) {
        try {
            const perfil = await configuracoesService.criarPerfil(req.body);

            res.status(201).json({
                success: true,
                message: 'Perfil criado com sucesso',
                data: perfil
            });
        } catch (error) {
            if (error.message.includes('já existe')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async atualizarPerfil(req, res, next) {
        try {
            const { id } = req.params;
            const perfil = await configuracoesService.atualizarPerfil(id, req.body);

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: perfil
            });
        } catch (error) {
            if (error.message === 'Perfil não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('já existe') || error.message.includes('perfis padrão')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async deletarPerfil(req, res, next) {
        try {
            const { id } = req.params;
            const result = await configuracoesService.deletarPerfil(id);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Perfil não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('perfis padrão') || error.message.includes('usuários vinculados')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // ==================== USUÁRIOS ====================

    async listarUsuarios(req, res, next) {
        try {
            const filtros = req.query;
            const result = await configuracoesService.listarUsuarios(filtros);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async buscarUsuarioPorId(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await configuracoesService.buscarUsuarioPorId(id);

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            if (error.message === 'Usuário não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async criarUsuario(req, res, next) {
        try {
            const usuario = await configuracoesService.criarUsuario(req.body);

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: usuario
            });
        } catch (error) {
            if (error.message.includes('E-mail já cadastrado') ||
                error.message.includes('Perfil não encontrado')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async atualizarUsuario(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await configuracoesService.atualizarUsuario(id, req.body);

            res.json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: usuario
            });
        } catch (error) {
            if (error.message === 'Usuário não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('E-mail já cadastrado') ||
                error.message.includes('Perfil não encontrado')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    async deletarUsuario(req, res, next) {
        try {
            const { id } = req.params;
            const result = await configuracoesService.deletarUsuario(id);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Usuário não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('último administrador')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // ==================== BACKUP ====================

    async getConfiguracoesBackup(req, res, next) {
        try {
            const config = await configuracoesService.getConfiguracoesBackup();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracoesBackup(req, res, next) {
        try {
            const config = await configuracoesService.atualizarConfiguracoesBackup(req.body);

            res.json({
                success: true,
                message: 'Configurações de backup atualizadas com sucesso',
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async realizarBackup(req, res, next) {
        try {
            const resultado = await configuracoesService.realizarBackup();

            res.json({
                success: true,
                message: 'Backup realizado com sucesso',
                data: resultado
            });
        } catch (error) {
            next(error);
        }
    }

    async listarBackups(req, res, next) {
        try {
            const backups = await configuracoesService.listarBackups();

            res.json({
                success: true,
                data: backups
            });
        } catch (error) {
            next(error);
        }
    }

    async restaurarBackup(req, res, next) {
        try {
            const { filename } = req.params;
            const resultado = await configuracoesService.restaurarBackup(filename);

            res.json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // ==================== AUDITORIA ====================

    async getLogsAuditoria(req, res, next) {
        try {
            const filtros = req.query;
            const result = await configuracoesService.getLogsAuditoria(filtros);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConfiguracoesController();