const express = require('express');
const router = express.Router();
const clienteController = require('./controller');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de consulta
router.get('/', clienteController.listar);
router.get('/:id', clienteController.buscarPorId);

// Rotas de modificação (requerem autorização)
router.post('/', authorize('ADMIN', 'ATENDENTE'), clienteController.criar);
router.put('/:id', authorize('ADMIN', 'ATENDENTE'), clienteController.atualizar);
router.delete('/:id', authorize('ADMIN'), clienteController.deletar);

module.exports = router;