const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class EmpresaService {
    // Obter configurações (garante que existe um registro)
    async getConfig() {
        let config = await prisma.empresa.findFirst();
        if (!config) {
            // Criar registro padrão se não existir
            config = await prisma.empresa.create({
                data: {
                    nome: "Oficina Mecânica",
                    impostoIss: 0,
                    impostoIcms: 0,
                    comissaoMecanico: 0,
                    toleranciaCancelamentoHoras: 2
                }
            });
        }
        return config;
    }

    // Atualizar configurações (somente campos enviados)
    async updateConfig(data, usuarioId) {
        // Buscar configuração existente ou criar padrão
        const current = await this.getConfig();

        // Filtrar apenas campos que vieram no request
        const updateData = {};
        const allowedFields = [
            'nome', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 'telefone', 'email',
            'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep',
            'impostoIss', 'impostoIcms', 'comissaoMecanico', 'toleranciaCancelamentoHoras'
        ];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        // Se enviou logoUrl, tratar separadamente
        if (data.logoUrl !== undefined) {
            updateData.logoUrl = data.logoUrl;
        }

        const config = await prisma.empresa.update({
            where: { id: current.id },
            data: updateData
        });

        logger.info(`Configurações da empresa atualizadas por usuário ${usuarioId}`);
        return config;
    }

    // Atualizar apenas a URL do logo (usado após upload)
    async updateLogo(logoUrl, usuarioId) {
        const current = await this.getConfig();
        const config = await prisma.empresa.update({
            where: { id: current.id },
            data: { logoUrl }
        });
        logger.info(`Logo da empresa atualizado por usuário ${usuarioId}`);
        return config;
    }
}

module.exports = new EmpresaService();