import api from "./index";

export const financeiroAPI = {
    // ==================== DASHBOARD ====================
    getDashboard: async () => {
        const response = await api.get("/financeiro/dashboard");
        return response.data;
    },

    getFluxoCaixa: async (dataInicio, dataFim) => {
        const response = await api.get("/financeiro/fluxo-caixa", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    getRelatorio: async (dataInicio, dataFim) => {
        const response = await api.get("/financeiro/relatorio", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    getMonthlyRevenue: async (ano) => {
        const response = await api.get("/financeiro/monthly-revenue", { params: { ano } });
        return response.data;
    },

    // ==================== CONTAS A RECEBER ====================
    listarContasReceber: async (params = {}) => {
        const response = await api.get("/financeiro/contas-receber", { params });
        return response.data;
    },

    buscarContaReceber: async (id) => {
        const response = await api.get(`/financeiro/contas-receber/${id}`);
        return response.data;
    },

    criarContaReceber: async (dados) => {
        const response = await api.post("/financeiro/contas-receber", dados);
        return response.data;
    },

    // ==================== CONTAS A PAGAR ====================
    listarContasPagar: async (params = {}) => {
        const response = await api.get("/financeiro/contas-pagar", { params });
        return response.data;
    },

    buscarContaPagar: async (id) => {
        const response = await api.get(`/financeiro/contas-pagar/${id}`);
        return response.data;
    },

    criarContaPagar: async (dados) => {
        const response = await api.post("/financeiro/contas-pagar", dados);
        return response.data;
    },

    // ==================== AÇÕES ====================
    registrarPagamento: async (id, dados) => {
        const response = await api.patch(`/financeiro/${id}/pagar`, dados);
        return response.data;
    },

    estornarPagamento: async (id, motivo = "") => {
        const response = await api.patch(`/financeiro/${id}/estornar`, { motivo });
        return response.data;
    },

    cancelarConta: async (id, motivo = "") => {
        const response = await api.patch(`/financeiro/${id}/cancelar`, { motivo });
        return response.data;
    }
};