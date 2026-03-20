const express = require('express');
const router = express.Router();
const empresaController = require('./controller');
const validations = require('./validations');
const validate = require('../../middlewares/validator');
const { authenticate, authorize } = require('../../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração de upload para o logo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../uploads/empresa');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `logo-${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagem não permitido. Use JPG, PNG ou GIF.'));
    }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// Rotas
router.use(authenticate);
router.use(authorize('ADMIN')); // Apenas administradores podem ver/alterar

router.get('/', empresaController.getConfig);
router.put('/', validate(validations.atualizar), empresaController.updateConfig);
router.post('/logo', upload.single('logo'), empresaController.uploadLogo);

module.exports = router;