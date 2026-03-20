const express = require('express');
const router = express.Router();
const perfilController = require('./controller');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas de perfis requerem autenticação e perfil ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', perfilController.listar);
router.get('/:id', perfilController.buscarPorId);
router.post('/', perfilController.criar);
router.put('/:id', perfilController.atualizar);
router.delete('/:id', perfilController.deletar);

module.exports = router;