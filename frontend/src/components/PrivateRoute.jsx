import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
    const { user } = useAuth();

    // Se não tem usuário, redireciona para login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se tem usuário, mostra o conteúdo
    return children;
}