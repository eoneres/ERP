import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3334/api",
    headers: {
        "Content-Type": "application/json",
    },
});



// Interceptor para ADICIONAR o token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("@oficina:token");

        console.log("=".repeat(50));
        console.log("🔍 REQUISIÇÃO PARA:", config.url);
        console.log("🔑 TOKEN NO STORAGE:", token ? "✅ Existe" : "❌ Não existe");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ HEADER AUTHORIZATION ADICIONADO:");
            console.log("   Bearer " + token.substring(0, 20) + "...");
        } else {
            console.log("⚠️ NENHUM TOKEN ENCONTRADO");
        }

        console.log("=".repeat(50));
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para TRATAR erros de resposta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("🚫 ERRO 401 - Token inválido ou expirado");
            console.log("URL que causou o erro:", error.config?.url);

            // Não redirecionar para login se for a rota de login
            if (!error.config?.url?.includes('/auth/login')) {
                localStorage.removeItem("@oficina:token");
                localStorage.removeItem("@oficina:user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;