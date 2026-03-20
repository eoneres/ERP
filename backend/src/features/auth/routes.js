const express = require('express');
const router = express.Router();
const authController = require('./controller');
const authValidations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate } = require('../../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting para login (prevenir brute force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        success: false,
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rotas públicas
router.post(
    '/login',
    loginLimiter,
    validate(authValidations.login),
    authController.login
);

router.post(
    '/refresh-token',
    validate(authValidations.refreshToken),
    authController.refreshToken
);

router.post(
    '/forgot-password',
    validate(authValidations.forgotPassword),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validate(authValidations.resetPassword),
    authController.resetPassword
);

// Rotas protegidas (requerem autenticação)
router.post(
    '/logout',
    authenticate,
    authController.logout
);

router.post(
    '/change-password',
    authenticate,
    validate(authValidations.changePassword),
    authController.changePassword
);

router.get(
    '/verify',
    authenticate,
    authController.verifyToken
);

module.exports = router;