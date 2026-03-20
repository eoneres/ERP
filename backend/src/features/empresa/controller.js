const empresaService = require('./service');

class EmpresaController {
    async getConfig(req, res, next) {
        try {
            const config = await empresaService.getConfig();
            res.json({ success: true, data: config });
        } catch (error) {
            next(error);
        }
    }

    async updateConfig(req, res, next) {
        try {
            const config = await empresaService.updateConfig(req.body, req.usuario.id);
            res.json({ success: true, message: 'Configurações atualizadas', data: config });
        } catch (error) {
            next(error);
        }
    }

    // Endpoint específico para upload de logo (se usar multer)
    async uploadLogo(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            const logoUrl = `/uploads/empresa/${req.file.filename}`;
            const config = await empresaService.updateLogo(logoUrl, req.usuario.id);
            res.json({ success: true, message: 'Logo atualizado', data: config });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EmpresaController();