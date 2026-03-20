const { body, param, query } = require('express-validator');

const veiculoValidations = {
    criar: [
        body('placa')
            .notEmpty().withMessage('Placa é obrigatória')
            .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/)
            .withMessage('Placa inválida. Formato: ABC1234 ou ABC1D23')
            .toUpperCase()
            .trim(),
        body('renavam')
            .optional()
            .matches(/^\d{11}$/)
            .withMessage('RENAVAM deve ter 11 dígitos')
            .trim(),
        body('chassi')
            .optional()
            .isLength({ min: 17, max: 17 }).withMessage('Chassi deve ter 17 caracteres')
            .matches(/^[A-HJ-NPR-Z0-9]+$/).withMessage('Chassi contém caracteres inválidos')
            .toUpperCase()
            .trim(),
        body('marca')
            .notEmpty().withMessage('Marca é obrigatória')
            .trim()
            .escape(),
        body('modelo')
            .notEmpty().withMessage('Modelo é obrigatório')
            .trim()
            .escape(),
        body('anoFabricacao')
            .notEmpty().withMessage('Ano de fabricação é obrigatório')
            .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
            .withMessage('Ano de fabricação inválido'),
        body('anoModelo')
            .notEmpty().withMessage('Ano do modelo é obrigatório')
            .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
            .withMessage('Ano do modelo inválido'),
        body('cor')
            .optional()
            .trim()
            .escape(),
        body('combustivel')
            .optional()
            .isIn(['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'ELETRICO', 'HIBRIDO'])
            .withMessage('Combustível inválido'),
        body('cambio')
            .optional()
            .isIn(['MANUAL', 'AUTOMATICO', 'CVT', 'SEQUENCIAL'])
            .withMessage('Câmbio inválido'),
        body('kmAtual')
            .optional()
            .isInt({ min: 0 }).withMessage('Quilometragem deve ser um número positivo'),
        body('clienteId')
            .notEmpty().withMessage('Cliente é obrigatório')
            .isInt().withMessage('ID do cliente inválido'),
        body('observacoes')
            .optional()
            .trim()
            .escape()
    ],

    atualizar: [
        param('id')
            .isInt().withMessage('ID inválido'),
        body('placa')
            .optional()
            .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/)
            .withMessage('Placa inválida. Formato: ABC1234 ou ABC1D23')
            .toUpperCase()
            .trim(),
        body('renavam')
            .optional()
            .matches(/^\d{11}$/)
            .withMessage('RENAVAM deve ter 11 dígitos'),
        body('chassi')
            .optional()
            .isLength({ min: 17, max: 17 }).withMessage('Chassi deve ter 17 caracteres')
            .matches(/^[A-HJ-NPR-Z0-9]+$/).withMessage('Chassi contém caracteres inválidos')
            .toUpperCase(),
        body('marca')
            .optional()
            .trim()
            .escape(),
        body('modelo')
            .optional()
            .trim()
            .escape(),
        body('anoFabricacao')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
            .withMessage('Ano de fabricação inválido'),
        body('anoModelo')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
            .withMessage('Ano do modelo inválido'),
        body('cor')
            .optional()
            .trim()
            .escape(),
        body('combustivel')
            .optional()
            .isIn(['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'ELETRICO', 'HIBRIDO'])
            .withMessage('Combustível inválido'),
        body('cambio')
            .optional()
            .isIn(['MANUAL', 'AUTOMATICO', 'CVT', 'SEQUENCIAL'])
            .withMessage('Câmbio inválido'),
        body('kmAtual')
            .optional()
            .isInt({ min: 0 }).withMessage('Quilometragem deve ser um número positivo'),
        body('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso'),
        body('observacoes')
            .optional()
            .trim()
            .escape()
    ],

    listar: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
        query('search')
            .optional()
            .trim()
            .escape(),
        query('clienteId')
            .optional()
            .isInt().withMessage('ID do cliente inválido'),
        query('marca')
            .optional()
            .trim()
            .escape(),
        query('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    ],

    buscarPorId: [
        param('id')
            .isInt().withMessage('ID inválido')
    ],

    deletar: [
        param('id')
            .isInt().withMessage('ID inválido')
    ],

    atualizarKm: [
        param('id')
            .isInt().withMessage('ID inválido'),
        body('kmAtual')
            .notEmpty().withMessage('Quilometragem é obrigatória')
            .isInt({ min: 0 }).withMessage('Quilometragem deve ser um número positivo'),
        body('observacao')
            .optional()
            .trim()
            .escape()
    ]
};

module.exports = veiculoValidations;