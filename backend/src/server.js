const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

const PORT = config.port || 3334;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📝 Documentação: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM recebido, fechando servidor...');
    server.close(() => {
        logger.info('Servidor fechado');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejeitada não capturada:', reason);
    process.exit(1);
});