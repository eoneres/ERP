const { body, param } = require('express-validator');

const configuracoesValidations = {
    // Configurações da empresa
    atualizarEmpresa: [
        body('nome')
            .optional()
            .trim()
            .notEmpty().withMessage('Nome não pode ser vazio')
            .isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
        body('razaoSocial')
            .optional()
            .trim()
            .notEmpty().withMessage('Razão social não pode ser vazia')
            .isLength({ max: 100 }).withMessage('Razão social deve ter no máximo 100 caracteres'),
        body('cnpj')
            .optional()
            .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
            .withMessage('CNPJ inválido'),
        body('ie')
            .optional()
            .trim(),
        body('im')
            .optional()
            .trim(),
        body('telefone1')
            .optional()
            .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
            .withMessage('Telefone inválido'),
        body('telefone2')
            .optional()
            .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/)
            .withMessage('Telefone inválido'),
        body('email')
            .optional()
            .isEmail().withMessage('E-mail inválido'),
        body('website')
            .optional()
            .isURL().withMessage('URL inválida'),
        body('cep')
            .optional()
            .matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido'),
        body('endereco')
            .optional()
            .trim()
            .escape(),
        body('numero')
            .optional()
            .trim(),
        body('complemento')
            .optional()
            .trim()
            .escape(),
        body('bairro')
            .optional()
            .trim()
            .escape(),
        body('cidade')
            .optional()
            .trim()
            .escape(),
        body('uf')
            .optional()
            .isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres')
            .toUpperCase(),
        body('logo')
            .optional()
            .isURL().withMessage('URL da logo inválida'),
        body('observacoes')
            .optional()
            .trim()
            .escape()
    ],

    // Configurações gerais
    atualizarConfiguracoesGerais: [
        body('horarioFuncionamento.inicio')
            .optional()
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início inválido'),
        body('horarioFuncionamento.fim')
            .optional()
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de fim inválido'),
        body('diasFuncionamento')
            .optional()
            .isArray().withMessage('Dias de funcionamento deve ser um array'),
        body('diasFuncionamento.*')
            .optional()
            .isInt({ min: 0, max: 6 }).withMessage('Dia da semana inválido'),
        body('tempoPadraoAgendamento')
            .optional()
            .isInt({ min: 15, max: 480 }).withMessage('Tempo padrão deve ser entre 15 e 480 minutos'),
        body('permiteAgendamentoOnline')
            .optional()
            .isBoolean().withMessage('Permite agendamento online deve ser verdadeiro ou falso'),
        body('notificacoes.email')
            .optional()
            .isBoolean().withMessage('Notificação por email deve ser verdadeiro ou falso'),
        body('notificacoes.whatsapp')
            .optional()
            .isBoolean().withMessage('Notificação por WhatsApp deve ser verdadeiro ou falso'),
        body('notificacoes.sms')
            .optional()
            .isBoolean().withMessage('Notificação por SMS deve ser verdadeiro ou falso')
    ],

    // Configurações financeiras
    atualizarConfiguracoesFinanceiras: [
        body('formaPagamentoPadrao')
            .optional()
            .isIn(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX', 'BOLETO', 'TRANSFERENCIA'])
            .withMessage('Forma de pagamento inválida'),
        body('prazoMedioRecebimento')
            .optional()
            .isInt({ min: 1, max: 90 }).withMessage('Prazo deve ser entre 1 e 90 dias'),
        body('prazoMedioPagamento')
            .optional()
            .isInt({ min: 1, max: 90 }).withMessage('Prazo deve ser entre 1 e 90 dias'),
        body('jurosMensal')
            .optional()
            .isFloat({ min: 0, max: 20 }).withMessage('Juros mensal deve ser entre 0 e 20%'),
        body('multaAtraso')
            .optional()
            .isFloat({ min: 0, max: 10 }).withMessage('Multa por atraso deve ser entre 0 e 10%'),
        body('descontoMaximo')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Desconto máximo deve ser entre 0 e 100%'),
        body('carenciaDesconto')
            .optional()
            .isInt({ min: 0, max: 30 }).withMessage('Carência para desconto deve ser entre 0 e 30 dias')
    ],

    // Perfis
    criarPerfil: [
        body('nome')
            .notEmpty().withMessage('Nome do perfil é obrigatório')
            .isLength({ min: 3, max: 50 }).withMessage('Nome deve ter entre 3 e 50 caracteres')
            .trim()
            .toUpperCase(),
        body('descricao')
            .optional()
            .trim()
            .escape(),
        body('permissoes')
            .isObject().withMessage('Permissões devem ser um objeto')
    ],

    atualizarPerfil: [
        param('id')
            .isInt().withMessage('ID inválido'),
        body('nome')
            .optional()
            .isLength({ min: 3, max: 50 }).withMessage('Nome deve ter entre 3 e 50 caracteres')
            .trim()
            .toUpperCase(),
        body('descricao')
            .optional()
            .trim()
            .escape(),
        body('permissoes')
            .optional()
            .isObject().withMessage('Permissões devem ser um objeto')
    ],

    deletarPerfil: [
        param('id')
            .isInt().withMessage('ID inválido')
    ],

    // Usuários
    criarUsuario: [
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
            .isInt().withMessage('Perfil inválido')
    ],

    atualizarUsuario: [
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

    // Backup
    configurarBackup: [
        body('ativo')
            .optional()
            .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso'),
        body('frequencia')
            .optional()
            .isIn(['DIARIO', 'SEMANAL', 'MENSAL']).withMessage('Frequência inválida'),
        body('horario')
            .optional()
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário inválido'),
        body('diasSemana')
            .optional()
            .isArray().withMessage('Dias da semana deve ser um array'),
        body('diasSemana.*')
            .optional()
            .isInt({ min: 0, max: 6 }).withMessage('Dia da semana inválido'),
        body('manterBackups')
            .optional()
            .isInt({ min: 1, max: 90 }).withMessage('Número de backups deve ser entre 1 e 90'),
        body('local')
            .optional()
            .isIn(['LOCAL', 'S3', 'GOOGLE_DRIVE']).withMessage('Local de backup inválido')
    ]
};

module.exports = configuracoesValidations;