const express = require('express');
const cors = require('cors');  // ← APENAS UMA VEZ!
const path = require('path');
const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Importar rotas
const authRoutes = require('./features/auth/routes');
const usuarioRoutes = require('./features/usuarios/routes');
const perfilRoutes = require('./features/perfis/routes');
const clienteRoutes = require('./features/clientes/routes');
const veiculoRoutes = require('./features/veiculos/routes');
const agendamentoRoutes = require('./features/agendamentos/routes');
const ordemServicoRoutes = require('./features/ordens-servico/routes');
const estoqueRoutes = require('./features/estoque/routes');
const financeiroRoutes = require('./features/financeiro/routes');
const relatoriosRoutes = require('./features/relatorios/routes');
const configuracoesRoutes = require('./features/configuracoes/routes');
const empresaRoutes = require('./features/empresa/routes');

const app = express();

// Configuração CORS - UMA VEZ
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logger de requisições
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfis', perfilRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/ordens-servico', ordemServicoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/empresa', empresaRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler global
app.use(errorHandler);

module.exports = app;