const express = require('express');
const router = express.Router();
const usuarioController = require('./controller');
const usuarioValidations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas de usuários requerem autenticação
router.use(authenticate);

// Rotas para o próprio usuário
router.get('/me', usuarioController.me);

// Rotas administrativas (apenas ADMIN)
router.get(
    '/',
    authorize('ADMIN'),
    validate(usuarioValidations.listar),
    usuarioController.listar
);

router.get(
    '/:id',
    authorize('ADMIN'),
    validate(usuarioValidations.buscarPorId),
    usuarioController.buscarPorId
);

router.post(
    '/',
    authorize('ADMIN'),
    validate(usuarioValidations.criar),
    usuarioController.criar
);

router.put(
    '/:id',
    authorize('ADMIN'),
    validate(usuarioValidations.atualizar),
    usuarioController.atualizar
);

router.delete(
    '/:id',
    authorize('ADMIN'),
    validate(usuarioValidations.deletar),
    usuarioController.deletar
);

router.patch(
    '/:id/toggle-status',
    authorize('ADMIN'),
    validate(usuarioValidations.buscarPorId),
    usuarioController.toggleStatus
);

router.get(
    '/:id/stats',
    authorize('ADMIN', 'MECANICO'),
    validate(usuarioValidations.buscarPorId),
    usuarioController.getStats
);

module.exports = router;