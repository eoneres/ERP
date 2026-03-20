const veiculoService = require('./service');
const logger = require('../../utils/logger');

class VeiculoController {
    // Listar veículos
    async listar(req, res, next) {
        try {
            const filtros = req.query;
            const result = await veiculoService.listar(filtros);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar veículo por ID
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            const veiculo = await veiculoService.buscarPorId(id);

            res.json({
                success: true,
                data: veiculo
            });
        } catch (error) {
            if (error.message === 'Veículo não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Buscar veículo por placa
    async buscarPorPlaca(req, res, next) {
        try {
            const { placa } = req.params;
            const veiculo = await veiculoService.buscarPorPlaca(placa);

            if (!veiculo) {
                return res.status(404).json({
                    success: false,
                    error: 'Veículo não encontrado'
                });
            }

            res.json({
                success: true,
                data: veiculo
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar veículos por cliente
    async buscarPorCliente(req, res, next) {
        try {
            const { clienteId } = req.params;
            const veiculos = await veiculoService.buscarPorCliente(clienteId);

            res.json({
                success: true,
                data: veiculos
            });
        } catch (error) {
            next(error);
        }
    }

    // Criar veículo
    async criar(req, res, next) {
        try {
            const veiculo = await veiculoService.criar(req.body);

            res.status(201).json({
                success: true,
                message: 'Veículo cadastrado com sucesso',
                data: veiculo
            });
        } catch (error) {
            if (error.message.includes('Placa já cadastrada') ||
                error.message.includes('Chassi já cadastrado') ||
                error.message.includes('RENAVAM já cadastrado') ||
                error.message.includes('Cliente não encontrado')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Atualizar veículo
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const veiculo = await veiculoService.atualizar(id, req.body);

            res.json({
                success: true,
                message: 'Veículo atualizado com sucesso',
                data: veiculo
            });
        } catch (error) {
            if (error.message === 'Veículo não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('Placa já cadastrada') ||
                error.message.includes('Chassi já cadastrado') ||
                error.message.includes('RENAVAM já cadastrado') ||
                error.message.includes('Cliente não encontrado')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Deletar veículo
    async deletar(req, res, next) {
        try {
            const { id } = req.params;
            const result = await veiculoService.deletar(id);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Veículo não encontrado') {
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

    // Ativar/Desativar veículo
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const result = await veiculoService.toggleStatus(id);

            res.json({
                success: true,
                message: result.message,
                data: { ativo: result.ativo }
            });
        } catch (error) {
            if (error.message === 'Veículo não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Atualizar quilometragem
    async atualizarKm(req, res, next) {
        try {
            const { id } = req.params;
            const { kmAtual, observacao } = req.body;

            const veiculo = await veiculoService.atualizarKm(id, kmAtual, observacao);

            res.json({
                success: true,
                message: 'Quilometragem atualizada com sucesso',
                data: veiculo
            });
        } catch (error) {
            if (error.message === 'Veículo não encontrado') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            if (error.message.includes('menor que a anterior')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Histórico de serviços
    async historicoServicos(req, res, next) {
        try {
            const { id } = req.params;
            const historico = await veiculoService.historicoServicos(id);

            res.json({
                success: true,
                data: historico
            });
        } catch (error) {
            next(error);
        }
    }

    // Estatísticas do veículo
    async getStats(req, res, next) {
        try {
            const { id } = req.params;
            const stats = await veiculoService.getStats(id);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VeiculoController();