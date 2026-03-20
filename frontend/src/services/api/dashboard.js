import api from "./index";

export const dashboardAPI = {
    getDashboard: async () => {
        try {
            console.log("📊 Buscando dados do dashboard...");
            const response = await api.get("/relatorios/dashboard");
            console.log("✅ Resposta do dashboard:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Erro ao carregar dashboard:", error);
            if (error.response?.status === 401) {
                console.log("🚫 Token inválido ou expirado");
            }
            throw error;
        }
    }
};