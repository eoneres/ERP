const agendamentoService = require('./service');
const logger = require('../../utils/logger');

class AgendamentoController {
    // Listar agendamentos
    async listar(req, res, next) {
        try {
            console.log("🔥 CONTROLLER.listar - Query recebida:", req.query);
            const filtros = req.query;
            const result = await agendamentoService.listar(filtros);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.log("❌ Erro no controller.listar:", error.message);
            next(error);
        }
    }

    // Buscar por período (para calendário)
    async buscarPorPeriodo(req, res, next) {
        try {
            console.log("🔥 CONTROLLER.buscarPorPeriodo - Query recebida:", req.query);
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    error: 'Data de início e fim são obrigatórias'
                });
            }

            const agendamentos = await agendamentoService.buscarPorPeriodo(dataInicio, dataFim);

            res.json({
                success: true,
                data: agendamentos
            });
        } catch (error) {
            console.log("❌ Erro no controller.buscarPorPeriodo:", error.message);
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

            const agendamento = await agendamentoService.buscarPorId(id);

            res.json({
                success: true,
                data: agendamento
            });
        } catch (error) {
            console.log("❌ Erro no controller.buscarPorId:", error.message);
            if (error.message === 'Agendamento não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    // Verificar disponibilidade
    async verificarDisponibilidade(req, res, next) {
        try {
            console.log("🔥 CONTROLLER.verificarDisponibilidade - Body recebido:", req.body);
            const { dataHora, mecanicoId, duracao } = req.body;

            const disponibilidade = await agendamentoService.verificarDisponibilidade(
                dataHora,
                mecanicoId,
                duracao
            );

            res.json({
                success: true,
                data: disponibilidade
            });
        } catch (error) {
            console.log("❌ Erro no controller.verificarDisponibilidade:", error.message);
            next(error);
        }
    }

    // Criar agendamento
    async criar(req, res, next) {
        try {
            console.log("🔥 CONTROLLER.criar - Body recebido:", req.body);

            const agendamento = await agendamentoService.criar(req.body);

            res.status(201).json({
                success: true,
                message: 'Agendamento criado com sucesso',
                data: agendamento
            });
        } catch (error) {
            console.log("❌ Erro no controller.criar:", error.message);
            if (error.message.includes('disponível') ||
                error.message.includes('encontrado') ||
                error.message.includes('pertence')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Atualizar agendamento
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const agendamento = await agendamentoService.atualizar(id, req.body);

            res.json({
                success: true,
                message: 'Agendamento atualizado com sucesso',
                data: agendamento
            });
        } catch (error) {
            console.log("❌ Erro no controller.atualizar:", error.message);
            if (error.message === 'Agendamento não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('disponível')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Deletar agendamento
    async deletar(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const result = await agendamentoService.deletar(id);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.log("❌ Erro no controller.deletar:", error.message);
            if (error.message === 'Agendamento não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('ordem de serviço')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Confirmar agendamento
    async confirmar(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const agendamento = await agendamentoService.confirmar(id);

            res.json({
                success: true,
                message: 'Agendamento confirmado com sucesso',
                data: agendamento
            });
        } catch (error) {
            console.log("❌ Erro no controller.confirmar:", error.message);
            if (error.message === 'Agendamento não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Apenas agendamentos pendentes')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Cancelar agendamento
    async cancelar(req, res, next) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const agendamento = await agendamentoService.cancelar(id, motivo);

            res.json({
                success: true,
                message: 'Agendamento cancelado com sucesso',
                data: agendamento
            });
        } catch (error) {
            console.log("❌ Erro no controller.cancelar:", error.message);
            if (error.message === 'Agendamento não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Não é possível cancelar')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Próximos agendamentos
    async buscarProximos(req, res, next) {
        try {
            const { limite } = req.query;
            const agendamentos = await agendamentoService.buscarProximos(limite || 10);

            res.json({
                success: true,
                data: agendamentos
            });
        } catch (error) {
            console.log("❌ Erro no controller.buscarProximos:", error.message);
            next(error);
        }
    }

    // Estatísticas
    async getStats(req, res, next) {
        try {
            const stats = await agendamentoService.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.log("❌ Erro no controller.getStats:", error.message);
            next(error);
        }
    }
}

module.exports = new AgendamentoController();