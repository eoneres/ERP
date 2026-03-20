const { body, param, query } = require('express-validator');

const agendamentoValidations = {
    criar: [
        body('dataHora').optional(),
        body('clienteId').optional(),
        body('veiculoId').optional(),
        body('servicos').optional(),
        body('observacoes').optional(),
        body('mecanicoId').optional()
    ],

    atualizar: [
        param('id').optional(),
        body('dataHora').optional(),
        body('status').optional(),
        body('mecanicoId').optional(),
        body('observacoes').optional()
    ],

    listar: [
        query('page').optional(),
        query('limit').optional(),
        query('dataInicio').optional(),
        query('dataFim').optional(),
        query('clienteId').optional(),
        query('veiculoId').optional(),
        query('mecanicoId').optional(),
        query('status').optional()
    ],

    buscarPorId: [
        param('id').optional()
    ],

    deletar: [
        param('id').optional()
    ],

    confirmar: [
        param('id').optional()
    ],

    cancelar: [
        param('id').optional(),
        body('motivo').optional()
    ],

    verificarDisponibilidade: [
        body('dataHora').optional(),
        body('mecanicoId').optional(),
        body('duracao').optional()
    ]
};

module.exports = agendamentoValidations;