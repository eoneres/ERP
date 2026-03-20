import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica se há usuário salvo no localStorage ao carregar
        const storedUser = localStorage.getItem("@oficina:user");
        const storedToken = localStorage.getItem("@oficina:token");

        if (storedUser && storedToken && storedUser !== "undefined") {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Configura o token no axios para requisições futuras
                api.defaults.headers.Authorization = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Erro ao fazer parse do usuário:", error);
                // Se o parse falhar, limpa o localStorage
                localStorage.removeItem("@oficina:user");
                localStorage.removeItem("@oficina:token");
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (email, password) => {
        try {
            console.log("📤 Enviando login para:", email);

            // Chamada real para o backend
            const response = await api.post("/auth/login", {
                email: email,
                senha: password
            });

            console.log("📥 Resposta do servidor:", response.data);

            const { usuario, accessToken, refreshToken } = response.data.data;

            // Salva no estado e localStorage
            setUser(usuario);
            localStorage.setItem("@oficina:user", JSON.stringify(usuario));
            localStorage.setItem("@oficina:token", accessToken);

            // Configura o token no axios
            api.defaults.headers.Authorization = `Bearer ${accessToken}`;

            console.log("✅ Login bem-sucedido!");
            return { success: true };
        } catch (error) {
            console.error("❌ Erro no login:", error);
            console.error("Resposta de erro:", error.response?.data);

            return {
                success: false,
                error: error.response?.data?.error || "Erro ao fazer login"
            };
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem("@oficina:user");
        localStorage.removeItem("@oficina:token");
        delete api.defaults.headers.Authorization;
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};