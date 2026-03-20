const usuarioService = require('./service');
const logger = require('../../utils/logger');

class UsuarioController {
    // Listar usuários
    async listar(req, res, next) {
        try {
            const filtros = req.query;
            const result = await usuarioService.listar(filtros);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar usuário por ID
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.buscarPorId(id);

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

    // Criar usuário
    async criar(req, res, next) {
        try {
            const usuario = await usuarioService.criar(req.body);

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: usuario
            });
        } catch (error) {
            if (error.message === 'E-mail já cadastrado') {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Atualizar usuário
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.atualizar(id, req.body);

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
            if (error.message.includes('E-mail já cadastrado')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Deletar usuário
    async deletar(req, res, next) {
        try {
            const { id } = req.params;

            // Não permitir deletar próprio usuário
            if (parseInt(id) === req.usuario.id) {
                return res.status(400).json({
                    success: false,
                    error: 'Você não pode excluir seu próprio usuário'
                });
            }

            const result = await usuarioService.deletar(id);

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
            if (error.message.includes('ordens de serviço')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Ativar/Desativar usuário
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;

            // Não permitir desativar próprio usuário
            if (parseInt(id) === req.usuario.id) {
                return res.status(400).json({
                    success: false,
                    error: 'Você não pode alterar o status do seu próprio usuário'
                });
            }

            const result = await usuarioService.toggleStatus(id);

            res.json({
                success: true,
                message: result.message,
                data: { ativo: result.ativo }
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

    // Estatísticas do usuário
    async getStats(req, res, next) {
        try {
            const { id } = req.params;
            const stats = await usuarioService.getStats(id);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // Perfil do usuário logado
    async me(req, res) {
        res.json({
            success: true,
            data: req.usuario
        });
    }
}

module.exports = new UsuarioController();