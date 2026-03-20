import api from "./index";

export const agendamentosAPI = {
    // Listar com filtros
    listar: async (params = {}) => {
        const response = await api.get("/agendamentos", { params });
        return response.data;
    },

    // Buscar por período (para calendário)
    buscarPorPeriodo: async (dataInicio, dataFim) => {
        const response = await api.get("/agendamentos/periodo", {
            params: { dataInicio, dataFim }
        });
        return response.data;
    },

    // Buscar próximos agendamentos
    buscarProximos: async (limite = 10) => {
        const response = await api.get("/agendamentos/proximos", {
            params: { limite }
        });
        return response.data;
    },

    // Buscar por ID
    buscarPorId: async (id) => {
        if (id === "novo") {
            return {
                data: {
                    id: null,
                    dataHora: "",
                    clienteId: "",
                    veiculoId: "",
                    servicos: "[]",
                    observacoes: "",
                    mecanicoId: null,
                    status: "PENDENTE"
                }
            };
        }
        const response = await api.get(`/agendamentos/${id}`);
        return response.data;
    },

    // Verificar disponibilidade
    verificarDisponibilidade: async (dataHora, mecanicoId = null, duracao = 60) => {
        const response = await api.post("/agendamentos/verificar-disponibilidade", {
            dataHora,
            mecanicoId,
            duracao
        });
        return response.data;
    },

    // Criar agendamento
    criar: async (dados) => {
        const response = await api.post("/agendamentos", dados);
        return response.data;
    },

    // Atualizar agendamento
    atualizar: async (id, dados) => {
        const response = await api.put(`/agendamentos/${id}`, dados);
        return response.data;
    },

    // Deletar agendamento
    deletar: async (id) => {
        const response = await api.delete(`/agendamentos/${id}`);
        return response.data;
    },

    // Confirmar agendamento
    confirmar: async (id) => {
        const response = await api.patch(`/agendamentos/${id}/confirmar`);
        return response.data;
    },

    // Cancelar agendamento
    cancelar: async (id, motivo) => {
        const response = await api.patch(`/agendamentos/${id}/cancelar`, { motivo });
        return response.data;
    },

    // Estatísticas
    getStats: async () => {
        const response = await api.get("/agendamentos/stats");
        return response.data;
    }
};