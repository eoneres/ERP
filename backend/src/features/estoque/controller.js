const estoqueService = require('./service');

class EstoqueController {
    // ==================== PEÇAS ====================
    async listarPecas(req, res, next) {
        try {
            const result = await estoqueService.listarPecas(req.query);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async buscarPecaPorId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const peca = await estoqueService.buscarPecaPorId(id);
            res.json({ success: true, data: peca });
        } catch (error) {
            if (error.message === 'Peça não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async criarPeca(req, res, next) {
        try {
            const peca = await estoqueService.criarPeca(req.body);
            res.status(201).json({ success: true, message: 'Peça criada', data: peca });
        } catch (error) {
            if (error.message.includes('Código já cadastrado')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async atualizarPeca(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const peca = await estoqueService.atualizarPeca(id, req.body);
            res.json({ success: true, message: 'Peça atualizada', data: peca });
        } catch (error) {
            if (error.message === 'Peça não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Código já cadastrado')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async deletarPeca(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const result = await estoqueService.deletarPeca(id);
            res.json({ success: true, message: result.message });
        } catch (error) {
            if (error.message === 'Peça não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    // ==================== MOVIMENTAÇÕES ====================
    async entradaEstoque(req, res, next) {
        try {
            const movimentacao = await estoqueService.entradaEstoque(req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Entrada registrada', data: movimentacao });
        } catch (error) {
            if (error.message === 'Peça não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async saidaEstoque(req, res, next) {
        try {
            console.log("📥 Controller saidaEstoque - body:", req.body);
            console.log("📥 Controller saidaEstoque - usuario:", req.usuario.id);
            const movimentacao = await estoqueService.saidaEstoque(req.body, req.usuario.id);
            res.status(201).json({ success: true, message: 'Saída registrada', data: movimentacao });
        } catch (error) {
            console.error('❌ Erro no controller saidaEstoque:', error);
            if (error.message.includes('Estoque insuficiente') || error.message === 'Peça não encontrada') {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async listarMovimentacoes(req, res, next) {
        try {
            const result = await estoqueService.listarMovimentacoes(req.query);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    // ==================== FORNECEDORES ====================
    async listarFornecedores(req, res, next) {
        try {
            const result = await estoqueService.listarFornecedores(req.query);
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async buscarFornecedorPorId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const fornecedor = await estoqueService.buscarFornecedorPorId(id);
            res.json({ success: true, data: fornecedor });
        } catch (error) {
            if (error.message === 'Fornecedor não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async criarFornecedor(req, res, next) {
        try {
            const fornecedor = await estoqueService.criarFornecedor(req.body);
            res.status(201).json({ success: true, message: 'Fornecedor criado', data: fornecedor });
        } catch (error) {
            if (error.message.includes('CNPJ já cadastrado')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async atualizarFornecedor(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const fornecedor = await estoqueService.atualizarFornecedor(id, req.body);
            res.json({ success: true, message: 'Fornecedor atualizado', data: fornecedor });
        } catch (error) {
            console.error('❌ Erro no controller ao atualizar fornecedor:', error);
            next(error);
        }
    }

    async deletarFornecedor(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const result = await estoqueService.deletarFornecedor(id);
            res.json({ success: true, message: result.message });
        } catch (error) {
            if (error.message === 'Fornecedor não encontrado') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('peças vinculadas')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // ==================== INVENTÁRIO ====================
    async ajustarEstoque(req, res, next) {
        try {
            const result = await estoqueService.ajustarEstoque(req.body, req.usuario.id);
            res.json({ success: true, message: result.message, data: { diferenca: result.diferenca } });
        } catch (error) {
            if (error.message === 'Peça não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    async getDashboardData(req, res, next) {
        try {
            const data = await estoqueService.getDashboardData();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getAlertasEstoque(req, res, next) {
        try {
            const alertas = await estoqueService.getAlertasEstoque();
            res.json({ success: true, data: alertas });
        } catch (error) {
            next(error);
        }
    }

    async getRelatorioMovimentacoes(req, res, next) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
            }
            const relatorio = await estoqueService.getRelatorioMovimentacoes(dataInicio, dataFim);
            res.json({ success: true, data: relatorio });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new EstoqueController();