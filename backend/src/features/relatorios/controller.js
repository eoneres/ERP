const relatoriosService = require('./service');
const logger = require('../../utils/logger');

class RelatoriosController {
    // Dashboard completo
    async getDashboardCompleto(req, res, next) {
        try {
            const dashboard = await relatoriosService.getDashboardCompleto();

            res.json({
                success: true,
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }

    // Relatório de vendas
    async relatorioVendas(req, res, next) {
        try {
            const relatorio = await relatoriosService.relatorioVendas(req.query);

            res.json({
                success: true,
                data: relatorio
            });
        } catch (error) {
            next(error);
        }
    }

    // Relatório de serviços
    async relatorioServicos(req, res, next) {
        try {
            const relatorio = await relatoriosService.relatorioServicos(req.query);

            res.json({
                success: true,
                data: relatorio
            });
        } catch (error) {
            next(error);
        }
    }

    // Relatório de clientes
    async relatorioClientes(req, res, next) {
        try {
            const relatorio = await relatoriosService.relatorioClientes(req.query);

            res.json({
                success: true,
                data: relatorio
            });
        } catch (error) {
            next(error);
        }
    }

    // Relatório de veículos
    async relatorioVeiculos(req, res, next) {
        try {
            const relatorio = await relatoriosService.relatorioVeiculos(req.query);

            res.json({
                success: true,
                data: relatorio
            });
        } catch (error) {
            next(error);
        }
    }

    // Relatório de estoque
    async relatorioEstoque(req, res, next) {
        try {
            const relatorio = await relatoriosService.relatorioEstoque(req.query);

            res.json({
                success: true,
                data: relatorio
            });
        } catch (error) {
            next(error);
        }
    }

    // Exportar para Excel
    async exportarExcel(req, res, next) {
        try {
            const { tipo } = req.params;
            const filtros = req.query;

            let dados;
            switch (tipo) {
                case 'vendas':
                    dados = await relatoriosService.relatorioVendas(filtros);
                    break;
                case 'servicos':
                    dados = await relatoriosService.relatorioServicos(filtros);
                    break;
                case 'clientes':
                    dados = await relatoriosService.relatorioClientes(filtros);
                    break;
                case 'veiculos':
                    dados = await relatoriosService.relatorioVeiculos(filtros);
                    break;
                case 'estoque':
                    dados = await relatoriosService.relatorioEstoque(filtros);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Tipo de relatório inválido'
                    });
            }

            // Aqui você implementaria a geração do Excel
            // Por enquanto, retornar os dados
            res.json({
                success: true,
                message: 'Exportação em Excel será implementada',
                data: dados
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RelatoriosController();