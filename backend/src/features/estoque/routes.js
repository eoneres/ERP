const express = require('express');
const router = express.Router();
const estoqueController = require('./controller');
const validations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticate);

// ==================== PEÇAS ====================
router.get('/pecas', validate(validations.listarPecas), estoqueController.listarPecas);
router.get('/pecas/:id', estoqueController.buscarPecaPorId);
router.post('/pecas', authorize('ADMIN', 'ATENDENTE'), validate(validations.criarPeca), estoqueController.criarPeca);
router.put('/pecas/:id', authorize('ADMIN', 'ATENDENTE'), validate(validations.atualizarPeca), estoqueController.atualizarPeca);
router.delete('/pecas/:id', authorize('ADMIN'), estoqueController.deletarPeca);

// ==================== MOVIMENTAÇÕES ====================
router.get('/movimentacoes', validate(validations.listarMovimentacoes), estoqueController.listarMovimentacoes);
router.post('/entrada', authorize('ADMIN', 'ATENDENTE'), validate(validations.entradaEstoque), estoqueController.entradaEstoque);
router.post('/saida', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), validate(validations.saidaEstoque), estoqueController.saidaEstoque);

// ==================== FORNECEDORES ====================
router.get('/fornecedores', validate(validations.listarFornecedores), estoqueController.listarFornecedores);
router.get('/fornecedores/:id', estoqueController.buscarFornecedorPorId);
router.post('/fornecedores', authorize('ADMIN', 'ATENDENTE'), validate(validations.criarFornecedor), estoqueController.criarFornecedor);
router.put('/fornecedores/:id',
    authorize('ADMIN', 'ATENDENTE'),
    // validate(validations.atualizarFornecedor),  // ← COMENTE ESTA LINHA
    estoqueController.atualizarFornecedor
);
router.delete('/fornecedores/:id', authorize('ADMIN'), estoqueController.deletarFornecedor);

// ==================== INVENTÁRIO ====================
router.post('/ajuste', authorize('ADMIN'), validate(validations.ajustarEstoque), estoqueController.ajustarEstoque);
router.get('/dashboard', estoqueController.getDashboardData);
router.get('/alertas', estoqueController.getAlertasEstoque);

// ==================== RELATÓRIOS ====================
router.get('/relatorio', estoqueController.getRelatorioMovimentacoes);

module.exports = router;