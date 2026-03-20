const authService = require('./service');
const logger = require('../../utils/logger');

class AuthController {
    // Login
    async login(req, res, next) {
        try {
            const { email, senha } = req.body;
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await authService.login(email, senha, ip, userAgent);

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: result
            });
        } catch (error) {
            logger.error('Erro no login:', error);

            if (error.message === 'Usuário não encontrado' ||
                error.message === 'Senha inválida') {
                return res.status(401).json({
                    success: false,
                    error: 'E-mail ou senha inválidos'
                });
            }

            if (error.message.includes('bloqueado')) {
                return res.status(403).json({
                    success: false,
                    error: error.message
                });
            }

            next(error);
        }
    }

    // Refresh token
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            const tokens = await authService.refreshToken(refreshToken);

            res.json({
                success: true,
                data: tokens
            });
        } catch (error) {
            logger.error('Erro no refresh token:', error);
            res.status(401).json({
                success: false,
                error: 'Refresh token inválido'
            });
        }
    }

    // Logout
    async logout(req, res, next) {
        try {
            await authService.logout(req.usuario.id);

            res.json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    }

    // Esqueci senha
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            await authService.forgotPassword(email);

            res.json({
                success: true,
                message: 'Se o e-mail existir em nossa base, você receberá instruções para recuperar sua senha'
            });
        } catch (error) {
            next(error);
        }
    }

    // Resetar senha
    async resetPassword(req, res, next) {
        try {
            const { token, senha } = req.body;

            await authService.resetPassword(token, senha);

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
        } catch (error) {
            logger.error('Erro ao resetar senha:', error);

            if (error.message === 'Token inválido ou expirado') {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            next(error);
        }
    }

    // Alterar senha (logado)
    async changePassword(req, res, next) {
        try {
            const { senhaAtual, novaSenha } = req.body;

            await authService.changePassword(
                req.usuario.id,
                senhaAtual,
                novaSenha
            );

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
        } catch (error) {
            if (error.message === 'Senha atual incorreta') {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Verificar token (útil para frontend)
    async verifyToken(req, res) {
        res.json({
            success: true,
            data: {
                usuario: req.usuario,
                expiraEm: req.tokenExp
            }
        });
    }
}

module.exports = new AuthController();