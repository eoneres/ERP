const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const [, token] = authHeader.split(' ');

        try {
            const decoded = jwt.verify(token, config.jwtSecret);

            // Buscar usuário no banco
            const usuario = await prisma.usuario.findUnique({
                where: { id: decoded.id },
                include: {
                    perfil: true
                }
            });

            if (!usuario || !usuario.ativo) {
                return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
            }

            req.usuario = usuario;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro na autenticação' });
    }
};

const authorize = (...perfis) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!perfis.includes(req.usuario.perfil.nome)) {
            return res.status(403).json({
                error: 'Acesso negado. Você não tem permissão para acessar este recurso'
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };