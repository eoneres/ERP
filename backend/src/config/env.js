const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT || 3333,
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    viaCepUrl: process.env.VIA_CEP_URL || 'https://viacep.com.br/ws'
};