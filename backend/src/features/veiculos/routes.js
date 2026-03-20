const express = require('express');
const router = express.Router();
const veiculoController = require('./controller');
const veiculoValidations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas de veículos requerem autenticação
router.use(authenticate);

// Rotas públicas (dentro do sistema)
router.get('/',
    validate(veiculoValidations.listar),
    veiculoController.listar
);

router.get('/placa/:placa',
    veiculoController.buscarPorPlaca
);

router.get('/cliente/:clienteId',
    veiculoController.buscarPorCliente
);

router.get('/:id',
    validate(veiculoValidations.buscarPorId),
    veiculoController.buscarPorId
);

router.get('/:id/historico',
    veiculoController.historicoServicos
);

router.get('/:id/stats',
    veiculoController.getStats
);

// Rotas que modificam dados (requerem autorização)
router.post('/',
    authorize('ADMIN', 'ATENDENTE'),
    validate(veiculoValidations.criar),
    veiculoController.criar
);

router.put('/:id',
    authorize('ADMIN', 'ATENDENTE'),
    validate(veiculoValidations.atualizar),
    veiculoController.atualizar
);

router.delete('/:id',
    authorize('ADMIN'),
    validate(veiculoValidations.deletar),
    veiculoController.deletar
);

router.patch('/:id/toggle-status',
    authorize('ADMIN'),
    validate(veiculoValidations.buscarPorId),
    veiculoController.toggleStatus
);

router.patch('/:id/km',
    authorize('ADMIN', 'ATENDENTE', 'MECANICO'),
    validate(veiculoValidations.atualizarKm),
    veiculoController.atualizarKm
);

module.exports = router;