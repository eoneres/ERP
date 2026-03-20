import api from "./index";

export const perfisAPI = {
    // Listar perfis
    listar: async () => {
        const response = await api.get("/perfis");
        return response.data;
    },

    // Buscar perfil por ID
    buscarPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    nome: "",
                    descricao: "",
                    permissoes: {}
                }
            };
        }
        const response = await api.get(`/perfis/${id}`);
        return response.data;
    },

    // Criar perfil
    criar: async (dados) => {
        const response = await api.post("/perfis", dados);
        return response.data;
    },

    // Atualizar perfil
    atualizar: async (id, dados) => {
        const response = await api.put(`/perfis/${id}`, dados);
        return response.data;
    },

    // Deletar perfil
    deletar: async (id) => {
        const response = await api.delete(`/perfis/${id}`);
        return response.data;
    }
};