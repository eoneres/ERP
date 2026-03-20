const { body, param, query } = require('express-validator');

module.exports = {
    // ==================== PEÇAS ====================
    criarPeca: [
        body('codigo')
            .notEmpty().withMessage('Código é obrigatório')
            .trim()
            .toUpperCase(),
        body('descricao')
            .notEmpty().withMessage('Descrição é obrigatória')
            .trim(),
        body('precoCusto')
            .notEmpty().withMessage('Preço de custo é obrigatório')
            .isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
        body('precoVenda')
            .notEmpty().withMessage('Preço de venda é obrigatório')
            .isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
        body('estoqueMinimo')
            .optional()
            .isInt({ min: 0 }).withMessage('Estoque mínimo deve ser positivo'),
        body('estoqueMaximo')
            .optional()
            .isInt({ min: 0 }).withMessage('Estoque máximo deve ser positivo'),
        body('fornecedorId')
            .optional()
            .isInt().withMessage('ID do fornecedor inválido')
    ],

    atualizarPeca: [
        param('id').isInt().withMessage('ID inválido'),
        body('codigo')
            .optional()
            .trim()
            .toUpperCase(),
        body('descricao')
            .optional()
            .trim(),
        body('precoCusto')
            .optional()
            .isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
        body('precoVenda')
            .optional()
            .isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
        body('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser true/false')
    ],

    listarPecas: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('search')
            .optional()
            .trim(),
        query('estoqueBaixo')
            .optional()
            .isBoolean().withMessage('estoqueBaixo deve ser true/false')
    ],

    // ==================== MOVIMENTAÇÕES ====================
    entradaEstoque: [
        body('pecaId')
            .notEmpty().withMessage('Peça é obrigatória')
            .isInt().withMessage('ID da peça inválido'),
        body('quantidade')
            .notEmpty().withMessage('Quantidade é obrigatória')
            .isInt({ min: 1 }).withMessage('Quantidade deve ser positiva'),
        body('motivo')
            .notEmpty().withMessage('Motivo é obrigatório')
            .isIn(['COMPRA', 'DEVOLUCAO', 'AJUSTE']).withMessage('Motivo inválido'),
        body('documento')
            .optional()
            .trim()
    ],

    saidaEstoque: [
        body('pecaId')
            .notEmpty().withMessage('Peça é obrigatória')
            .isInt().withMessage('ID da peça inválido'),
        body('quantidade')
            .notEmpty().withMessage('Quantidade é obrigatória')
            .isInt({ min: 1 }).withMessage('Quantidade deve ser positiva'),
        body('motivo')
            .notEmpty().withMessage('Motivo é obrigatório')
            .isIn(['VENDA', 'PERDA', 'AJUSTE']).withMessage('Motivo inválido')
    ],

    listarMovimentacoes: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('pecaId')
            .optional()
            .isInt().withMessage('ID da peça inválido')
    ],

    // ==================== FORNECEDORES ====================
    criarFornecedor: [
        body('razaoSocial')
            .notEmpty().withMessage('Razão social é obrigatória')
            .trim(),
        body('cnpj')
            .notEmpty().withMessage('CNPJ é obrigatório')
            .matches(/^\d{14}$/).withMessage('CNPJ deve ter 14 dígitos'),
        body('telefone1')
            .notEmpty().withMessage('Telefone é obrigatório')
    ],

    listarFornecedores: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
        query('search')
            .optional()
            .trim()
    ],

    // ==================== INVENTÁRIO ====================
    ajustarEstoque: [
        body('pecaId')
            .notEmpty().withMessage('Peça é obrigatória')
            .isInt().withMessage('ID da peça inválido'),
        body('quantidadeAtual')
            .notEmpty().withMessage('Quantidade atual é obrigatória')
            .isInt({ min: 0 }).withMessage('Quantidade deve ser positiva'),
        body('motivo')
            .notEmpty().withMessage('Motivo é obrigatório')
            .trim()
    ]
};