const clienteService = require('./service');
const logger = require('../../utils/logger');

class ClienteController {
    // Listar clientes
    async listar(req, res, next) {
        try {
            const result = await clienteService.listar(req.query);
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar por ID
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const cliente = await clienteService.buscarPorId(id);

            res.json({
                success: true,
                data: cliente
            });
        } catch (error) {
            if (error.message === 'Cliente não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    // Criar cliente
    async criar(req, res, next) {
        try {
            const cliente = await clienteService.criar(req.body);

            logger.info(`Cliente criado: ${cliente.nome}`);

            res.status(201).json({
                success: true,
                message: 'Cliente criado com sucesso',
                data: cliente
            });
        } catch (error) {
            if (error.message.includes('Documento já cadastrado')) {
                return res.status(409).json({ error: error.message });
            }
            if (error.message.includes('deve ter')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Atualizar cliente
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const cliente = await clienteService.atualizar(id, req.body);

            logger.info(`Cliente atualizado: ${cliente.nome}`);

            res.json({
                success: true,
                message: 'Cliente atualizado com sucesso',
                data: cliente
            });
        } catch (error) {
            if (error.message === 'Cliente não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Documento já cadastrado')) {
                return res.status(409).json({ error: error.message });
            }
            if (error.message.includes('deve ter')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Deletar cliente
    async deletar(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const result = await clienteService.deletar(id);

            logger.info(`Cliente desativado: ID ${id}`);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Cliente não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('ordens de serviço')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = new ClienteController();