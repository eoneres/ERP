const perfilService = require('./service');
const logger = require('../../utils/logger');

class PerfilController {
    // Listar perfis
    async listar(req, res, next) {
        try {
            const perfis = await perfilService.listar();

            res.json({
                success: true,
                data: perfis
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar perfil por ID
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            const perfil = await perfilService.buscarPorId(id);

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

    // Criar perfil
    async criar(req, res, next) {
        try {
            const perfil = await perfilService.criar(req.body);

            res.status(201).json({
                success: true,
                message: 'Perfil criado com sucesso',
                data: perfil
            });
        } catch (error) {
            if (error.message.includes('já existe')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Atualizar perfil
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const perfil = await perfilService.atualizar(id, req.body);

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
            if (error.message.includes('já existe')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Deletar perfil
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            await perfilService.deletar(id);

            res.json({
                success: true,
                message: 'Perfil excluído com sucesso'
            });
        } catch (error) {
            if (error.message === 'Perfil não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('usuários vinculados') ||
                error.message.includes('perfis padrão')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new PerfilController();