import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/globals.css";

console.log("🚀 Main.jsx carregado!");

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

console.log("📦 QueryClient criado");

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#363636",
                            color: "#fff",
                        },
                    }}
                />
            </QueryClientProvider>
        </HelmetProvider>
    </React.StrictMode>
);

console.log("✅ App renderizado!");