const express = require('express');
const router = express.Router();
const configuracoesController = require('./controller');
const configuracoesValidations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas de configurações requerem autenticação e perfil ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

// ==================== CONFIGURAÇÕES DA EMPRESA ====================

router.get('/empresa',
    configuracoesController.getConfiguracoesEmpresa
);

router.put('/empresa',
    validate(configuracoesValidations.atualizarEmpresa),
    configuracoesController.atualizarConfiguracoesEmpresa
);

// ==================== CONFIGURAÇÕES GERAIS ====================

router.get('/gerais',
    configuracoesController.getConfiguracoesGerais
);

router.put('/gerais',
    validate(configuracoesValidations.atualizarConfiguracoesGerais),
    configuracoesController.atualizarConfiguracoesGerais
);

// ==================== CONFIGURAÇÕES FINANCEIRAS ====================

router.get('/financeiras',
    configuracoesController.getConfiguracoesFinanceiras
);

router.put('/financeiras',
    validate(configuracoesValidations.atualizarConfiguracoesFinanceiras),
    configuracoesController.atualizarConfiguracoesFinanceiras
);

// ==================== PERFIS ====================

router.get('/perfis',
    configuracoesController.listarPerfis
);

router.get('/perfis/:id',
    configuracoesController.buscarPerfilPorId
);

router.post('/perfis',
    validate(configuracoesValidations.criarPerfil),
    configuracoesController.criarPerfil
);

router.put('/perfis/:id',
    validate(configuracoesValidations.atualizarPerfil),
    configuracoesController.atualizarPerfil
);

router.delete('/perfis/:id',
    validate(configuracoesValidations.deletarPerfil),
    configuracoesController.deletarPerfil
);

// ==================== USUÁRIOS ====================

router.get('/usuarios',
    configuracoesController.listarUsuarios
);

router.get('/usuarios/:id',
    configuracoesController.buscarUsuarioPorId
);

router.post('/usuarios',
    validate(configuracoesValidations.criarUsuario),
    configuracoesController.criarUsuario
);

router.put('/usuarios/:id',
    validate(configuracoesValidations.atualizarUsuario),
    configuracoesController.atualizarUsuario
);

router.delete('/usuarios/:id',
    validate(configuracoesValidations.deletarUsuario),
    configuracoesController.deletarUsuario
);

// ==================== BACKUP ====================

router.get('/backup/config',
    configuracoesController.getConfiguracoesBackup
);

router.put('/backup/config',
    validate(configuracoesValidations.configurarBackup),
    configuracoesController.atualizarConfiguracoesBackup
);

router.post('/backup/executar',
    configuracoesController.realizarBackup
);

router.get('/backup/listar',
    configuracoesController.listarBackups
);

router.post('/backup/restaurar/:filename',
    configuracoesController.restaurarBackup
);

// ==================== AUDITORIA ====================

router.get('/auditoria',
    configuracoesController.getLogsAuditoria
);

module.exports = router;