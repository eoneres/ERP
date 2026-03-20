import api from "./index";

export const estoqueAPI = {
    // ==================== PEÇAS ====================
    listarPecas: async (params = {}) => {
        const response = await api.get("/estoque/pecas", { params });
        return response.data;
    },

    buscarPecaPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    codigo: "",
                    descricao: "",
                    categoria: "",
                    marca: "",
                    localizacao: "",
                    estoqueMinimo: 0,
                    estoqueMaximo: 0,
                    estoqueAtual: 0,
                    precoCusto: 0,
                    precoVenda: 0,
                    fornecedorId: null,
                    ativo: true
                }
            };
        }
        const response = await api.get(`/estoque/pecas/${id}`);
        return response.data;
    },

    criarPeca: async (peca) => {
        const response = await api.post("/estoque/pecas", peca);
        return response.data;
    },

    atualizarPeca: async (id, peca) => {
        const response = await api.put(`/estoque/pecas/${id}`, peca);
        return response.data;
    },

    deletarPeca: async (id) => {
        const response = await api.delete(`/estoque/pecas/${id}`);
        return response.data;
    },

    // ==================== MOVIMENTAÇÕES ====================
    listarMovimentacoes: async (params = {}) => {
        const response = await api.get("/estoque/movimentacoes", { params });
        return response.data;
    },

    entradaEstoque: async (dados) => {
        const response = await api.post("/estoque/entrada", dados);
        return response.data;
    },

    saidaEstoque: async (dados) => {
        const response = await api.post("/estoque/saida", dados);
        return response.data;
    },

    // ==================== FORNECEDORES ====================
    listarFornecedores: async (params = {}) => {
        const response = await api.get("/estoque/fornecedores", { params });
        return response.data;
    },

    buscarFornecedorPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    razaoSocial: "",
                    nomeFantasia: "",
                    cnpj: "",
                    inscricaoEstadual: "",
                    telefone1: "",
                    telefone2: "",
                    email: "",
                    contato: "",
                    cep: "",
                    endereco: "",
                    numero: "",
                    complemento: "",
                    bairro: "",
                    cidade: "",
                    uf: "",
                    observacoes: "",
                    ativo: true
                }
            };
        }
        const response = await api.get(`/estoque/fornecedores/${id}`);
        return response.data;
    },

    criarFornecedor: async (fornecedor) => {
        const response = await api.post("/estoque/fornecedores", fornecedor);
        return response.data;
    },

    atualizarFornecedor: async (id, fornecedor) => {
        const response = await api.put(`/estoque/fornecedores/${id}`, fornecedor);
        return response.data;
    },

    deletarFornecedor: async (id) => {
        const response = await api.delete(`/estoque/fornecedores/${id}`);
        return response.data;
    },

    // ==================== INVENTÁRIO ====================
    ajustarEstoque: async (dados) => {
        const response = await api.post("/estoque/ajuste", dados);
        return response.data;
    },

    getDashboardData: async () => {
        const response = await api.get("/estoque/dashboard");
        return response.data;
    },

    getAlertasEstoque: async () => {
        const response = await api.get("/estoque/alertas");
        return response.data;
    }
};