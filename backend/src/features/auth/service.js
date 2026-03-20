const prisma = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class AuthService {
    // Gerar tokens JWT
    generateTokens(userId, userEmail, userPerfil) {
        const payload = {
            id: userId,
            email: userEmail,
            perfil: userPerfil
        };

        const accessToken = jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: '15m' } // Token curto para segurança
        );

        const refreshToken = jwt.sign(
            { id: userId },
            config.jwtSecret + 'refresh', // Secret diferente para refresh
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    // Login
    async login(email, senha, ip, userAgent) {
        try {
            // Buscar usuário com perfil
            const usuario = await prisma.usuario.findUnique({
                where: { email },
                include: {
                    perfil: {
                        select: {
                            id: true,
                            nome: true,
                            permissoes: true
                        }
                    }
                }
            });

            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            if (!usuario.ativo) {
                throw new Error('Usuário inativo. Contate o administrador');
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                // Registrar tentativa falha
                await this.registrarTentativaFalha(usuario.id, ip);
                throw new Error('Senha inválida');
            }

            console.log('👤 Status do usuário:', usuario.ativo);
            console.log('👤 Perfil ID:', usuario.perfilId);
            console.log('👤 Perfil nome:', usuario.perfil?.nome);

            if (!usuario.ativo) {
                console.log('❌ Usuário inativo!');
                throw new Error('Usuário inativo');
            }

            if (!usuario.perfil) {
                console.log('❌ Usuário sem perfil!');
                throw new Error('Perfil não encontrado');
            }

            // Verificar se usuário está bloqueado por muitas tentativas
            const bloqueado = await this.verificarBloqueio(usuario.id);
            if (bloqueado) {
                throw new Error('Usuário bloqueado temporariamente por muitas tentativas');
            }

            // Gerar tokens
            const { accessToken, refreshToken } = this.generateTokens(
                usuario.id,
                usuario.email,
                usuario.perfil.nome
            );

            // Salvar refresh token no banco
            await this.salvarRefreshToken(usuario.id, refreshToken);

            // Registrar login bem-sucedido
            await this.registrarLogin(usuario.id, ip, userAgent);

            // Atualizar último acesso
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { ultimoAcesso: new Date() }
            });

            // Remover dados sensíveis
            delete usuario.senha;

            return {
                usuario,
                accessToken,
                refreshToken
            };
        } catch (error) {
            logger.error('Erro no login:', error);
            throw error;
        }
    }

    // Refresh token
    async refreshToken(refreshToken) {
        try {
            // Verificar refresh token
            const decoded = jwt.verify(
                refreshToken,
                config.jwtSecret + 'refresh'
            );

            // Buscar token no banco
            const tokenData = await prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken,
                    usuarioId: decoded.id,
                    expiraEm: { gt: new Date() },
                    revogado: false
                },
                include: {
                    usuario: {
                        include: {
                            perfil: true
                        }
                    }
                }
            });

            if (!tokenData) {
                throw new Error('Refresh token inválido ou expirado');
            }

            // Gerar novos tokens
            const tokens = this.generateTokens(
                tokenData.usuario.id,
                tokenData.usuario.email,
                tokenData.usuario.perfil.nome
            );

            // Revogar token antigo
            await prisma.refreshToken.update({
                where: { id: tokenData.id },
                data: { revogado: true }
            });

            // Salvar novo refresh token
            await this.salvarRefreshToken(
                tokenData.usuario.id,
                tokens.refreshToken
            );

            return tokens;
        } catch (error) {
            logger.error('Erro no refresh token:', error);
            throw new Error('Refresh token inválido');
        }
    }

    // Salvar refresh token no banco
    async salvarRefreshToken(usuarioId, token) {
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 7); // 7 dias

        await prisma.refreshToken.create({
            data: {
                token,
                usuarioId,
                expiraEm
            }
        });
    }

    // Logout (revogar todos os tokens)
    async logout(usuarioId) {
        await prisma.refreshToken.updateMany({
            where: {
                usuarioId,
                revogado: false
            },
            data: { revogado: true }
        });
    }

    // Registrar tentativa de login falha
    async registrarTentativaFalha(usuarioId, ip) {
        const tentativa = await prisma.tentativaLogin.create({
            data: {
                usuarioId,
                ip,
                sucesso: false
            }
        });

        // Contar tentativas nos últimos 15 minutos
        const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);

        const tentativasRecentes = await prisma.tentativaLogin.count({
            where: {
                usuarioId,
                createdAt: { gte: quinzeMinutosAtras },
                sucesso: false
            }
        });

        // Bloquear após 5 tentativas
        if (tentativasRecentes >= 5) {
            await prisma.usuario.update({
                where: { id: usuarioId },
                data: { bloqueadoAte: new Date(Date.now() + 30 * 60 * 1000) } // 30 minutos
            });
        }
    }

    // Verificar se usuário está bloqueado
    async verificarBloqueio(usuarioId) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { bloqueadoAte: true }
        });

        if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
            return true;
        }

        // Se passou do tempo, desbloquear
        if (usuario.bloqueadoAte && usuario.bloqueadoAte <= new Date()) {
            await prisma.usuario.update({
                where: { id: usuarioId },
                data: { bloqueadoAte: null }
            });
        }

        return false;
    }

    // Registrar login bem-sucedido
    async registrarLogin(usuarioId, ip, userAgent) {
        await prisma.tentativaLogin.create({
            data: {
                usuarioId,
                ip,
                userAgent,
                sucesso: true
            }
        });
    }

    // Solicitar recuperação de senha
    async forgotPassword(email) {
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            // Não informar se usuário existe por segurança
            return { success: true };
        }

        // Gerar token único
        const token = crypto.randomBytes(32).toString('hex');
        const expiraEm = new Date();
        expiraEm.setHours(expiraEm.getHours() + 1); // 1 hora

        // Salvar token
        await prisma.passwordResetToken.create({
            data: {
                token,
                usuarioId: usuario.id,
                expiraEm
            }
        });

        logger.info(`Token de recuperação gerado para ${email}`);

        return { success: true };
    }

    // Resetar senha
    async resetPassword(token, novaSenha) {
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token,
                expiraEm: { gt: new Date() },
                utilizado: false
            },
            include: {
                usuario: true
            }
        });

        if (!resetToken) {
            throw new Error('Token inválido ou expirado');
        }

        // Hash da nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha
        await prisma.usuario.update({
            where: { id: resetToken.usuarioId },
            data: { senha: senhaHash }
        });

        // Marcar token como utilizado
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { utilizado: true }
        });

        // Revogar todos os refresh tokens por segurança
        await prisma.refreshToken.updateMany({
            where: {
                usuarioId: resetToken.usuarioId,
                revogado: false
            },
            data: { revogado: true }
        });

        logger.info(`Senha resetada para usuário ${resetToken.usuarioId}`);
    }

    // Alterar senha (usuário logado)
    async changePassword(usuarioId, senhaAtual, novaSenha) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaValida) {
            throw new Error('Senha atual incorreta');
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { id: usuarioId },
            data: { senha: senhaHash }
        });

        // Revogar todos os refresh tokens
        await prisma.refreshToken.updateMany({
            where: {
                usuarioId,
                revogado: false
            },
            data: { revogado: true }
        });

        logger.info(`Senha alterada para usuário ${usuarioId}`);
    }

    // Verificar token (middleware)
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);

            const usuario = await prisma.usuario.findUnique({
                where: { id: decoded.id },
                include: {
                    perfil: true
                }
            });

            if (!usuario || !usuario.ativo) {
                throw new Error('Usuário inválido');
            }

            return usuario;
        } catch (error) {
            throw new Error('Token inválido');
        }
    }
}

module.exports = new AuthService();