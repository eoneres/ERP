const financeiroService = require('./service');

class FinanceiroController {
    // ==================== CONTAS A RECEBER ====================

    async listarContasReceber(req, res, next) {
        try {
            const filtros = req.query;
            const result = await financeiroService.listarContasReceber(filtros);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async buscarContaReceber(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const conta = await financeiroService.buscarContaReceberPorId(id);
            res.json({ success: true, data: conta });
        } catch (error) {
            if (error.message === 'Conta não encontrada' || error.message === 'Conta não é do tipo receita') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async criarContaReceber(req, res, next) {
        try {
            const conta = await financeiroService.criarContaReceber(req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Conta a receber criada', data: conta });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('já possui')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // ==================== CONTAS A PAGAR ====================

    async listarContasPagar(req, res, next) {
        try {
            const filtros = req.query;
            const result = await financeiroService.listarContasPagar(filtros);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async buscarContaPagar(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const conta = await financeiroService.buscarContaPagarPorId(id);
            res.json({ success: true, data: conta });
        } catch (error) {
            if (error.message === 'Conta não encontrada' || error.message === 'Conta não é do tipo despesa') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async criarContaPagar(req, res, next) {
        try {
            const conta = await financeiroService.criarContaPagar(req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Conta a pagar criada', data: conta });
        } catch (error) {
            if (error.message.includes('não encontrado')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // ==================== PAGAMENTOS ====================

    async registrarPagamento(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const conta = await financeiroService.registrarPagamento(id, req.body, req.usuario.id);
            res.json({ success: true, message: 'Pagamento registrado', data: conta });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('não pode')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async estornarPagamento(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const { motivo } = req.body;
            const conta = await financeiroService.estornarPagamento(id, motivo, req.usuario.id);
            res.json({ success: true, message: 'Pagamento estornado', data: conta });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('não pode')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async cancelarConta(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const { motivo } = req.body;
            const conta = await financeiroService.cancelarConta(id, motivo, req.usuario.id);
            res.json({ success: true, message: 'Conta cancelada', data: conta });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('não pode')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // ==================== FLUXO DE CAIXA ====================

    async getFluxoCaixa(req, res, next) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
            }
            const fluxo = await financeiroService.getFluxoCaixa(dataInicio, dataFim);
            res.json({ success: true, data: fluxo });
        } catch (error) {
            next(error);
        }
    }

    async getDashboard(req, res, next) {
        try {
            const dados = await financeiroService.getDashboardData();
            res.json({ success: true, data: dados });
        } catch (error) {
            next(error);
        }
    }

    async getRelatorio(req, res, next) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
            }
            const relatorio = await financeiroService.getRelatorioPeriodo(dataInicio, dataFim);
            res.json({ success: true, data: relatorio });
        } catch (error) {
            next(error);
        }
    }

    async getMonthlyRevenue(req, res, next) {
        try {
            const { ano } = req.query;
            const data = await financeiroService.getMonthlyRevenue(ano);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new FinanceiroController();