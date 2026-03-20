const osService = require('./service');

class OrdemServicoController {
    async listar(req, res, next) {
        try {
            const filtros = req.query;
            const result = await osService.listar(filtros);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const os = await osService.buscarPorId(id);
            res.json({ success: true, data: os });
        } catch (error) {
            if (error.message === 'Ordem de serviço não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async criar(req, res, next) {
        try {
            console.log("📥 Dados recebidos no backend:", req.body);
            const os = await osService.criar(req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'OS criada com sucesso', data: os });
        } catch (error) {
            console.error("❌ Erro no controller:", error);
            if (error.message.includes('não encontrado') || error.message.includes('não pertence') || error.message.includes('já possui')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const os = await osService.atualizar(id, req.body);
            res.json({ success: true, message: 'OS atualizada', data: os });
        } catch (error) {
            if (error.message === 'Ordem de serviço não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('não pertence')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async adicionarServico(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const servico = await osService.adicionarServico(id, req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Serviço adicionado', data: servico });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('Não é possível')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async adicionarPeca(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const peca = await osService.adicionarPeca(id, req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Peça adicionada', data: peca });
        } catch (error) {
            if (error.message.includes('Estoque insuficiente') || error.message.includes('não encontrada') || error.message.includes('Não é possível')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async removerItem(req, res, next) {
        try {
            const { id, itemId, tipo } = req.params;
            if (!id || id === 'undefined' || !itemId || !tipo) {
                return res.status(400).json({ error: 'Parâmetros inválidos' });
            }
            const result = await osService.removerItem(id, itemId, tipo, req.usuario.id);  // ← passa o usuário
            res.json({ success: true, message: result.message });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('Não é possível')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async alterarStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, motivo } = req.body;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const os = await osService.alterarStatus(id, status, motivo, req.usuario.id);
            res.json({ success: true, message: 'Status alterado', data: os });
        } catch (error) {
            if (error.message.includes('não encontrada') || error.message.includes('obrigatória') || error.message.includes('Apenas') || error.message.includes('Não é possível')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async resumoFinanceiro(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const resumo = await osService.getResumoFinanceiro(id);
            res.json({ success: true, data: resumo });
        } catch (error) {
            if (error.message === 'OS não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async getRelatorio(req, res, next) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
            }
            const relatorio = await osService.getRelatorio(dataInicio, dataFim);
            res.json({ success: true, data: relatorio });
        } catch (error) {
            next(error);
        }
    }

    async getTopServicos(req, res, next) {
        try {
            const { dataInicio, dataFim, limit = 10 } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
            }
            const top = await osService.getTopServicos(dataInicio, dataFim, parseInt(limit));
            res.json({ success: true, data: top });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new OrdemServicoController();