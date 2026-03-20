const { body } = require('express-validator');

const empresaValidations = {
    atualizar: [
        body('nome').optional().trim(),
        body('nomeFantasia').optional().trim(),
        body('cnpj').optional().custom(value => {
            if (value && !/^\d{14}$/.test(value)) {
                throw new Error('CNPJ deve ter 14 dígitos');
            }
            return true;
        }),
        body('inscricaoEstadual').optional().trim(),
        body('telefone').optional().trim(),
        body('email').optional().isEmail().withMessage('E-mail inválido'),
        body('endereco').optional().trim(),
        body('numero').optional().trim(),
        body('complemento').optional().trim(),
        body('bairro').optional().trim(),
        body('cidade').optional().trim(),
        body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres'),
        body('cep').optional().custom(value => {
            if (value && !/^\d{8}$/.test(value)) {
                throw new Error('CEP deve ter 8 dígitos');
            }
            return true;
        }),
        body('impostoIss').optional().isFloat({ min: 0, max: 100 }).withMessage('ISS deve ser entre 0 e 100'),
        body('impostoIcms').optional().isFloat({ min: 0, max: 100 }).withMessage('ICMS deve ser entre 0 e 100'),
        body('comissaoMecanico').optional().isFloat({ min: 0, max: 100 }).withMessage('Comissão deve ser entre 0 e 100'),
        body('toleranciaCancelamentoHoras').optional().isInt({ min: 0 }).withMessage('Tolerância deve ser um número inteiro positivo')
    ]
};

module.exports = empresaValidations;