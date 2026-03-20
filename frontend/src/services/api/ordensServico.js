import api from "./index";

export const ordensServicoAPI = {
    // Listar OS
    listar: async (params = {}) => {
        const response = await api.get("/ordens-servico", { params });
        return response.data;
    },

    // Buscar por ID
    buscarPorId: async (id) => {
        if (id === "nova") {
            return {
                data: {
                    id: null,
                    clienteId: "",
                    veiculoId: "",
                    kmEntrada: "",
                    kmSaida: "",
                    tipo: "SERVICO",
                    observacoes: "",
                    agendamentoId: null,
                    status: "ABERTA",
                    servicos: [],
                    pecas: []
                }
            };
        }
        const response = await api.get(`/ordens-servico/${id}`);
        return response.data;
    },

    // Criar OS
    criar: async (dados) => {
        console.log("📡 Enviando POST para /ordens-servico com dados:", dados);
        const response = await api.post("/ordens-servico", dados);
        return response.data;
    },

    // Atualizar OS
    atualizar: async (id, dados) => {
        const response = await api.put(`/ordens-servico/${id}`, dados);
        return response.data;
    },

    // Adicionar serviço
    adicionarServico: async (osId, dados) => {
        const response = await api.post(`/ordens-servico/${osId}/servicos`, dados);
        return response.data;
    },

    // Adicionar peça
    adicionarPeca: async (osId, dados) => {
        const response = await api.post(`/ordens-servico/${osId}/pecas`, dados);
        return response.data;
    },

    // Remover item (serviço ou peça)
    removerItem: async (osId, tipo, itemId) => {
        const response = await api.delete(`/ordens-servico/${osId}/itens/${tipo}/${itemId}`);
        return response.data;
    },

    // Alterar status
    alterarStatus: async (osId, status, motivo = "") => {
        const response = await api.patch(`/ordens-servico/${osId}/status`, { status, motivo });
        return response.data;
    },

    // Resumo financeiro
    resumoFinanceiro: async (osId) => {
        const response = await api.get(`/ordens-servico/${osId}/financeiro`);
        return response.data;
    }
};