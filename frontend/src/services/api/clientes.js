import api from "./index";

export const clientesAPI = {
    listar: async (params = {}) => {
        const response = await api.get("/clientes", { params });
        return response.data;
    },

    buscarPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    nome: "",
                    tipo: "FISICA",
                    documento: "",
                    rg: "",
                    inscricaoEstadual: "",
                    dataNascimento: "",
                    telefone1: "",
                    telefone2: "",
                    email: "", // ← JÁ DEVE TER
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
        const response = await api.get(`/clientes/${id}`);
        return response.data;
    },

    criar: async (cliente) => {
        const response = await api.post("/clientes", cliente);
        return response.data;
    },

    atualizar: async (id, cliente) => {
        const response = await api.put(`/clientes/${id}`, cliente);
        return response.data;
    },

    deletar: async (id) => {
        await api.delete(`/clientes/${id}`);
        return { success: true };
    }
};