const { body, param } = require('express-validator');

const usuarioValidations = {
    criar: [
        body('nome')
            .notEmpty().withMessage('Nome é obrigatório')
            .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres')
            .trim()
            .escape(),
        body('email')
            .notEmpty().withMessage('E-mail é obrigatório')
            .isEmail().withMessage('E-mail inválido')
            .normalizeEmail()
            .toLowerCase(),
        body('senha')
            .notEmpty().withMessage('Senha é obrigatória')
            .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
        body('telefone')
            .optional()
            .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
            .withMessage('Telefone inválido'),
        body('perfilId')
            .notEmpty().withMessage('Perfil é obrigatório')
            .isInt().withMessage('Perfil inválido'),
        body('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    ],

    atualizar: [
        param('id')
            .isInt().withMessage('ID inválido'),
        body('nome')
            .optional()
            .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres')
            .trim()
            .escape(),
        body('email')
            .optional()
            .isEmail().withMessage('E-mail inválido')
            .normalizeEmail()
            .toLowerCase(),
        body('telefone')
            .optional()
            .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
            .withMessage('Telefone inválido'),
        body('perfilId')
            .optional()
            .isInt().withMessage('Perfil inválido'),
        body('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    ],

    listar: [
        body('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
        body('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
        body('search')
            .optional()
            .trim()
            .escape()
    ],

    buscarPorId: [
        param('id')
            .isInt().withMessage('ID inválido')
    ],

    deletar: [
        param('id')
            .isInt().withMessage('ID inválido')
    ]
};

module.exports = usuarioValidations;