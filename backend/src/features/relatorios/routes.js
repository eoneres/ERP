const express = require('express');
const router = express.Router();
const relatoriosController = require('./controller');
const { authenticate, authorize } = require('../../middlewares/auth');

// Todas as rotas de relatórios requerem autenticação
router.use(authenticate);

// Dashboard (acessível a todos)
router.get('/dashboard',
    relatoriosController.getDashboardCompleto
);

// Relatórios (acessíveis a ADMIN e ATENDENTE)
router.get('/vendas',
    authorize('ADMIN', 'ATENDENTE'),
    relatoriosController.relatorioVendas
);

router.get('/servicos',
    authorize('ADMIN', 'ATENDENTE', 'MECANICO'),
    relatoriosController.relatorioServicos
);

router.get('/clientes',
    authorize('ADMIN', 'ATENDENTE'),
    relatoriosController.relatorioClientes
);

router.get('/veiculos',
    authorize('ADMIN', 'ATENDENTE'),
    relatoriosController.relatorioVeiculos
);

router.get('/estoque',
    authorize('ADMIN', 'ATENDENTE'),
    relatoriosController.relatorioEstoque
);

// Exportações (apenas ADMIN)
router.get('/exportar/:tipo',
    authorize('ADMIN'),
    relatoriosController.exportarExcel
);

module.exports = router;