import api from "./index";

export const dashboardAPI = {
    getDashboard: async () => {
        try {
            const { data } = await api.get("/relatorios/dashboard");
            return data.data;
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            throw error;
        }
    },
};