const express = require('express');
const router = express.Router();
const agendamentoController = require('./controller');
const agendamentoValidations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de consulta (acessíveis a todos)
router.get('/',
    validate(agendamentoValidations.listar),
    agendamentoController.listar
);

router.get('/proximos',
    agendamentoController.buscarProximos
);

router.get('/periodo',
    agendamentoController.buscarPorPeriodo
);

router.get('/stats',
    agendamentoController.getStats
);

router.get('/:id',
    validate(agendamentoValidations.buscarPorId),
    agendamentoController.buscarPorId
);

// Rotas de verificação
router.post('/verificar-disponibilidade',
    validate(agendamentoValidations.verificarDisponibilidade),
    agendamentoController.verificarDisponibilidade
);

// Rotas de modificação (requerem autorização)
router.post('/',
    authorize('ADMIN', 'ATENDENTE'),
    validate(agendamentoValidations.criar),
    agendamentoController.criar
);

router.put('/:id',
    authorize('ADMIN', 'ATENDENTE'),
    validate(agendamentoValidations.atualizar),
    agendamentoController.atualizar
);

router.delete('/:id',
    authorize('ADMIN'),
    validate(agendamentoValidations.deletar),
    agendamentoController.deletar
);

// Rotas de mudança de status
router.patch('/:id/confirmar',
    authorize('ADMIN', 'ATENDENTE'),
    validate(agendamentoValidations.confirmar),
    agendamentoController.confirmar
);

router.patch('/:id/cancelar',
    authorize('ADMIN', 'ATENDENTE', 'MECANICO'),
    validate(agendamentoValidations.cancelar),
    agendamentoController.cancelar
);

module.exports = router;