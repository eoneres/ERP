const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Middleware para logs
prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    logger.debug(`Query ${params.model}.${params.action} levou ${after - before}ms`);

    return result;
});

// Tratamento de erros de conexão
prisma.$on('error', (error) => {
    logger.error('Erro no Prisma Client:', error);
});

module.exports = prisma;