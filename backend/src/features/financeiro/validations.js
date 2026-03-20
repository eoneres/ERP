const { body, param, query } = require('express-validator');

const financeiroValidations = {
    // ==================== CONTAS A RECEBER ====================
    criarContaReceber: [
        body('ordemServicoId')
            .notEmpty().withMessage('Ordem de serviço é obrigatória')
            .isInt().withMessage('ID da OS inválido'),
        body('valorTotal')
            .notEmpty().withMessage('Valor total é obrigatório')
            .isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
        body('formaPagamento')
            .notEmpty().withMessage('Forma de pagamento é obrigatória')
            .isIn(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX', 'BOLETO', 'TRANSFERENCIA'])
            .withMessage('Forma de pagamento inválida'),
        body('parcelas')
            .optional()
            .isInt({ min: 1 }).withMessage('Número de parcelas deve ser positivo'),
        body('dataVencimento')
            .notEmpty().withMessage('Data de vencimento é obrigatória')
            .isISO8601().withMessage('Data inválida')
    ],

    // ==================== CONTAS A PAGAR ====================
    criarContaPagar: [
        body('descricao')
            .notEmpty().withMessage('Descrição é obrigatória')
            .trim(),
        body('valorTotal')
            .notEmpty().withMessage('Valor total é obrigatório')
            .isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
        body('formaPagamento')
            .notEmpty().withMessage('Forma de pagamento é obrigatória')
            .isIn(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX', 'BOLETO', 'TRANSFERENCIA'])
            .withMessage('Forma de pagamento inválida'),
        body('dataVencimento')
            .notEmpty().withMessage('Data de vencimento é obrigatória')
            .isISO8601().withMessage('Data inválida'),
        body('categoria')
            .optional()
            .isIn(['COMPRA', 'SALARIO', 'ALUGUEL', 'AGUA', 'LUZ', 'TELEFONE', 'INTERNET', 'IMPOSTO', 'OUTROS'])
            .withMessage('Categoria inválida'),
        body('fornecedorId')
            .optional()
            .isInt().withMessage('ID do fornecedor inválido')
    ],

    // ==================== LANÇAMENTOS GERAIS ====================
    registrarPagamento: [
        param('id')
            .isInt().withMessage('ID do lançamento inválido'),
        body('valorPago')
            .notEmpty().withMessage('Valor pago é obrigatório')
            .isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
        body('dataPagamento')
            .optional()
            .isISO8601().withMessage('Data de pagamento inválida')
    ],

    estornarPagamento: [
        param('id')
            .isInt().withMessage('ID do lançamento inválido'),
        body('motivo')
            .optional()
            .trim()
    ],

    // ==================== LISTAGENS E FILTROS ====================
    listarContasReceber: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('status')
            .optional()
            .isIn(['PENDENTE', 'PARCIAL', 'PAGO', 'CANCELADO'])
            .withMessage('Status inválido'),
        query('dataInicio')
            .optional()
            .isISO8601().withMessage('Data de início inválida'),
        query('dataFim')
            .optional()
            .isISO8601().withMessage('Data de fim inválida')
    ],

    listarContasPagar: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('status')
            .optional()
            .isIn(['PENDENTE', 'PARCIAL', 'PAGO', 'CANCELADO'])
            .withMessage('Status inválido'),
        query('categoria')
            .optional()
            .isIn(['COMPRA', 'SALARIO', 'ALUGUEL', 'AGUA', 'LUZ', 'TELEFONE', 'INTERNET', 'IMPOSTO', 'OUTROS'])
            .withMessage('Categoria inválida')
    ]
};

module.exports = financeiroValidations;