import api from "./index";

export const usuariosAPI = {
    // Listar usuários
    listar: async (params = {}) => {
        const response = await api.get("/usuarios", { params });
        return response.data;
    },

    // Buscar usuário por ID
    buscarPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    nome: "",
                    email: "",
                    telefone: "",
                    perfilId: "",
                    ativo: true
                }
            };
        }
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Criar usuário
    criar: async (dados) => {
        const response = await api.post("/usuarios", dados);
        return response.data;
    },

    // Atualizar usuário
    atualizar: async (id, dados) => {
        const response = await api.put(`/usuarios/${id}`, dados);
        return response.data;
    },

    // Desativar/Ativar usuário (toggle status)
    toggleStatus: async (id) => {
        const response = await api.patch(`/usuarios/${id}/toggle-status`);
        return response.data;
    },

    // Estatísticas do usuário (opcional)
    getStats: async (id) => {
        const response = await api.get(`/usuarios/${id}/stats`);
        return response.data;
    }
};