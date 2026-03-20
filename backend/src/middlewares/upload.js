const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Garantir que o diretório de upload existe
const uploadDir = path.join(__dirname, '../../', config.uploadDir);
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e PDF são aceitos.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSize
    }
});

module.exports = upload;