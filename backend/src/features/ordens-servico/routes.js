const express = require('express');
const router = express.Router();
const osController = require('./controller');
const validations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de consulta (acessíveis a todos)
// IMPORTANTE: rotas estáticas ANTES das rotas com parâmetros
router.get('/', validate(validations.listar), osController.listar);
router.get('/relatorio', osController.getRelatorio);
router.get('/top-servicos', osController.getTopServicos);

// Rotas com parâmetros
router.get('/:id', osController.buscarPorId);
router.get('/:id/financeiro', osController.resumoFinanceiro);

// Rotas de criação e modificação (requerem autorização)
router.post('/', authorize('ADMIN', 'ATENDENTE'), validate(validations.criar), osController.criar);
router.put('/:id', authorize('ADMIN', 'ATENDENTE'), validate(validations.atualizar), osController.atualizar);

// Rotas para itens da OS
router.post('/:id/servicos', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), validate(validations.adicionarServico), osController.adicionarServico);
router.post('/:id/pecas', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), validate(validations.adicionarPeca), osController.adicionarPeca);
router.delete('/:id/itens/:tipo/:itemId', authorize('ADMIN', 'ATENDENTE'), osController.removerItem);

// Rota para alterar status
router.patch('/:id/status', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), validate(validations.alterarStatus), osController.alterarStatus);

module.exports = router;