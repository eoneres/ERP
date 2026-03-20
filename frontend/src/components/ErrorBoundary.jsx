import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Atualiza o state para que a próxima renderização mostre a UI alternativa
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Você pode registrar o erro em um serviço de relatório (ex: Sentry)
        console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // UI alternativa personalizável via props
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8 max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                            Algo deu errado
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message || "Ocorreu um erro inesperado."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Recarregar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;