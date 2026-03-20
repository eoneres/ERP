import api from "./index";

export const relatoriosAPI = {
    // OS
    getRelatorioOS: async (dataInicio, dataFim) => {
        const response = await api.get("/ordens-servico/relatorio", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    getTopServicos: async (dataInicio, dataFim, limit = 10) => {
        const response = await api.get("/ordens-servico/top-servicos", {
            params: { dataInicio, dataFim, limit }
        });
        return response.data;
    },

    // Estoque
    getRelatorioEstoque: async (dataInicio, dataFim) => {
        const response = await api.get("/estoque/relatorio", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    // Financeiro (já existe, podemos reutilizar)
    getRelatorioFinanceiro: async (dataInicio, dataFim) => {
        const response = await api.get("/financeiro/relatorio", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    }
};