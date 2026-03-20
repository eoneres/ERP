const express = require('express');
const router = express.Router();
const financeiroController = require('./controller');
const validations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticate);

// ==================== DASHBOARD E RELATÓRIOS ====================
router.get('/dashboard', financeiroController.getDashboard);
router.get('/fluxo-caixa', financeiroController.getFluxoCaixa);
router.get('/relatorio', financeiroController.getRelatorio);
router.get('/monthly-revenue', financeiroController.getMonthlyRevenue);

// ==================== CONTAS A RECEBER ====================
router.get('/contas-receber', validate(validations.listarContasReceber), financeiroController.listarContasReceber);
router.get('/contas-receber/:id', financeiroController.buscarContaReceber);
router.post('/contas-receber', authorize('ADMIN', 'ATENDENTE'), validate(validations.criarContaReceber), financeiroController.criarContaReceber);

// ==================== CONTAS A PAGAR ====================
router.get('/contas-pagar', validate(validations.listarContasPagar), financeiroController.listarContasPagar);
router.get('/contas-pagar/:id', financeiroController.buscarContaPagar);
router.post('/contas-pagar', authorize('ADMIN', 'ATENDENTE'), validate(validations.criarContaPagar), financeiroController.criarContaPagar);

// ==================== AÇÕES GERAIS ====================
router.patch('/:id/pagar', authorize('ADMIN', 'ATENDENTE'), validate(validations.registrarPagamento), financeiroController.registrarPagamento);
router.patch('/:id/estornar', authorize('ADMIN'), validate(validations.estornarPagamento), financeiroController.estornarPagamento);
router.patch('/:id/cancelar', authorize('ADMIN'), financeiroController.cancelarConta);

module.exports = router;