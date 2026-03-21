const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    // Erro de validação do express-validator
    if (err.name === 'ValidationError' && Array.isArray(err.errors)) {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.errors.map(e => e.msg || e.message)
        });
    }

    // Erro do Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Registro duplicado',
                field: err.meta?.target || 'campo desconhecido'
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }
    }

    const status = err.status || 500;
    const message = err.message || 'Erro interno do servidor';

    res.status(status).json({ error: message });
};

module.exports = errorHandler;