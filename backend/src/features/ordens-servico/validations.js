const { body, param, query } = require('express-validator');

const osValidations = {
    criar: [
        body('clienteId')
            .notEmpty().withMessage('Cliente é obrigatório')
            .isInt().withMessage('ID do cliente inválido'),
        body('veiculoId')
            .notEmpty().withMessage('Veículo é obrigatório')
            .isInt().withMessage('ID do veículo inválido'),
        body('kmEntrada')
            .notEmpty().withMessage('Quilometragem de entrada é obrigatória')
            .isInt({ min: 0 }).withMessage('Quilometragem deve ser um número positivo'),
        body('tipo')
            .optional()
            .isIn(['SERVICO', 'ORCAMENTO']).withMessage('Tipo inválido'),
        body('observacoes')
            .optional()
            .trim()
            .escape(),
        body('agendamentoId')
            .optional()
            .isInt().withMessage('ID do agendamento inválido')
    ],

    atualizar: [
        param('id')
            .isInt().withMessage('ID inválido'),
        body('kmSaida')
            .optional()
            .isInt({ min: 0 }).withMessage('Quilometragem de saída deve ser positiva'),
        body('status')
            .optional()
            .isIn(['ABERTA', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA'])
            .withMessage('Status inválido'),
        body('observacoes')
            .optional()
            .trim()
            .escape()
    ],

    adicionarServico: [
        param('id')
            .isInt().withMessage('ID da OS inválido'),
        body('descricao')
            .notEmpty().withMessage('Descrição do serviço é obrigatória')
            .trim(),
        body('valorUnitario')
            .notEmpty().withMessage('Valor unitário é obrigatório')
            .isFloat({ min: 0 }).withMessage('Valor deve ser positivo'),
        body('quantidade')
            .optional()
            .isInt({ min: 1 }).withMessage('Quantidade deve ser no mínimo 1'),
        body('mecanicoId')
            .optional()
            .isInt().withMessage('ID do mecânico inválido')
    ],

    adicionarPeca: [
        param('id')
            .isInt().withMessage('ID da OS inválido'),
        body('pecaId')
            .notEmpty().withMessage('Peça é obrigatória')
            .isInt().withMessage('ID da peça inválido'),
        body('quantidade')
            .notEmpty().withMessage('Quantidade é obrigatória')
            .isInt({ min: 1 }).withMessage('Quantidade deve ser no mínimo 1'),
        body('desconto')
            .optional()
            .isFloat({ min: 0 }).withMessage('Desconto deve ser positivo')
    ],

    removerItem: [
        param('id')
            .isInt().withMessage('ID da OS inválido'),
        param('itemId')
            .isInt().withMessage('ID do item inválido'),
        param('tipo')
            .isIn(['servico', 'peca']).withMessage('Tipo deve ser servico ou peca')
    ],

    alterarStatus: [
        param('id')
            .isInt().withMessage('ID da OS inválido'),
        body('status')
            .notEmpty().withMessage('Status é obrigatório')
            .isIn(['ABERTA', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA'])
            .withMessage('Status inválido'),
        body('motivo')
            .optional()
            .trim()
            .escape()
    ],

    listar: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('status')
            .optional()
            .isIn(['ABERTA', 'AGUARDANDO_APROVACAO', 'APROVADA', 'EM_EXECUCAO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA'])
            .withMessage('Status inválido'),
        query('clienteId')
            .optional()
            .isInt().withMessage('ID do cliente inválido'),
        query('veiculoId')
            .optional()
            .isInt().withMessage('ID do veículo inválido'),
        query('periodoInicio')
            .optional()
            .isISO8601().withMessage('Data de início inválida'),
        query('periodoFim')
            .optional()
            .isISO8601().withMessage('Data de fim inválida')
    ]
};

module.exports = osValidations;