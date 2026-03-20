const { body } = require('express-validator');

const authValidations = {
    login: [
        body('email')
            .notEmpty().withMessage('E-mail é obrigatório')
            .isEmail().withMessage('E-mail inválido')
            .normalizeEmail()
            .toLowerCase(),
        body('senha')
            .notEmpty().withMessage('Senha é obrigatória')
            .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    ],

    registro: [
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
            .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Senha deve conter pelo menos uma letra e um número'),
        body('confirmarSenha')
            .notEmpty().withMessage('Confirmação de senha é obrigatória')
            .custom((value, { req }) => value === req.body.senha)
            .withMessage('Senhas não conferem'),
        body('telefone')
            .optional()
            .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
            .withMessage('Telefone inválido')
    ],

    refreshToken: [
        body('refreshToken')
            .notEmpty().withMessage('Refresh token é obrigatório')
    ],

    forgotPassword: [
        body('email')
            .notEmpty().withMessage('E-mail é obrigatório')
            .isEmail().withMessage('E-mail inválido')
            .normalizeEmail()
    ],

    resetPassword: [
        body('token')
            .notEmpty().withMessage('Token é obrigatório'),
        body('senha')
            .notEmpty().withMessage('Nova senha é obrigatória')
            .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
        body('confirmarSenha')
            .notEmpty().withMessage('Confirmação de senha é obrigatória')
            .custom((value, { req }) => value === req.body.senha)
            .withMessage('Senhas não conferem')
    ],

    changePassword: [
        body('senhaAtual')
            .notEmpty().withMessage('Senha atual é obrigatória'),
        body('novaSenha')
            .notEmpty().withMessage('Nova senha é obrigatória')
            .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
            .custom((value, { req }) => value !== req.body.senhaAtual)
            .withMessage('Nova senha deve ser diferente da atual'),
        body('confirmarSenha')
            .notEmpty().withMessage('Confirmação de senha é obrigatória')
            .custom((value, { req }) => value === req.body.novaSenha)
            .withMessage('Senhas não conferem')
    ]
};

module.exports = authValidations;