import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            console.log("🔐 Tentando login com:", data.email);

            const result = await signIn(data.email, data.senha);

            if (result.success) {
                toast.success("Login realizado com sucesso!");
                console.log("✅ Redirecionando para dashboard...");
                navigate("/dashboard", { replace: true });
            } else {
                toast.error(result.error || "Erro ao fazer login");
            }
        } catch (error) {
            console.error("💥 Erro inesperado:", error);
            toast.error("Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sistema de Oficina Mecânica
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Faça login para acessar o sistema
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                E-mail
                            </label>
                            <input
                                {...register("email", {
                                    required: "E-mail é obrigatório",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "E-mail inválido",
                                    },
                                })}
                                type="email"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="E-mail"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="senha" className="sr-only">
                                Senha
                            </label>
                            <input
                                {...register("senha", {
                                    required: "Senha é obrigatória",
                                    minLength: {
                                        value: 6,
                                        message: "Senha deve ter no mínimo 6 caracteres",
                                    },
                                })}
                                type="password"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Senha"
                            />
                            {errors.senha && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.senha.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}