import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Páginas públicas
import Login from "./pages/auth/Login";

// Páginas privadas
import Dashboard from "./pages/dashboard";
import Clientes from "./pages/clientes";
import ClienteDetalhe from "./pages/clientes/Detalhe";
import Veiculos from "./pages/veiculos";
import VeiculoDetalhe from "./pages/veiculos/Detalhe";
import Agendamentos from "./pages/agendamentos";
import AgendamentoDetalhe from "./pages/agendamentos/Detalhe";
import OrdensServico from "./pages/os";
import OrdemServicoDetalhe from "./pages/os/Detalhe";
import Estoque from "./pages/estoque";
import EstoqueDetalhe from "./pages/estoque/Detalhe";
import Fornecedores from "./pages/estoque/Fornecedores";
import FornecedorDetalhe from "./pages/estoque/FornecedorDetalhe";
import Movimentacoes from "./pages/estoque/Movimentacoes";
import FinanceiroDashboard from "./pages/financeiro";
import ContasReceber from "./pages/financeiro/ContasReceber";
import ContasPagar from "./pages/financeiro/ContasPagar";
import ContaReceberDetalhe from "./pages/financeiro/ContaReceberDetalhe";
import ContaPagarDetalhe from "./pages/financeiro/ContaPagarDetalhe";
import Relatorios from "./pages/relatorios";
import RelatorioFinanceiro from "./pages/relatorios/Financeiro";
import RelatorioOS from "./pages/relatorios/OS";
import RelatorioServicos from "./pages/relatorios/Servicos";
import RelatorioEstoque from "./pages/relatorios/Estoque";
import Configuracoes from "./pages/configuracoes";
import Usuarios from "./pages/configuracoes/Usuarios";
import UsuarioDetalhe from "./pages/configuracoes/UsuarioDetalhe";
import Perfis from "./pages/configuracoes/Perfis";
import PerfilDetalhe from "./pages/configuracoes/PerfilDetalhe";
import EmpresaConfig from "./pages/configuracoes/Empresa";


console.log("📱 App.jsx carregado!");

function App() {
    console.log("🏠 Renderizando App");

    return (
        <ErrorBoundary>
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <ThemeProvider>
                    <AuthProvider>
                        <Routes>
                            {/* Rotas públicas */}
                            <Route path="/login" element={<Login />} />

                            {/* Rotas privadas */}
                            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<Dashboard />} />

                                {/* Clientes */}
                                <Route path="clientes">
                                    <Route index element={<Clientes />} />
                                    <Route path="novo" element={<ClienteDetalhe />} />
                                    <Route path="editar/:id" element={<ClienteDetalhe />} />
                                    <Route path=":id" element={<ClienteDetalhe />} />
                                </Route>

                                {/* Veículos */}
                                <Route path="veiculos">
                                    <Route index element={<Veiculos />} />
                                    <Route path="novo" element={<VeiculoDetalhe />} />
                                    <Route path="editar/:id" element={<VeiculoDetalhe />} />
                                    <Route path=":id" element={<VeiculoDetalhe />} />
                                </Route>

                                {/* Agendamentos */}
                                <Route path="agendamentos">
                                    <Route index element={<Agendamentos />} />
                                    <Route path="novo" element={<AgendamentoDetalhe />} />
                                    <Route path="editar/:id" element={<AgendamentoDetalhe />} />
                                    <Route path=":id" element={<AgendamentoDetalhe />} />
                                </Route>

                                {/* Ordens de Serviço */}
                                <Route path="os">
                                    <Route index element={<OrdensServico />} />
                                    <Route path="nova" element={<OrdemServicoDetalhe />} />
                                    <Route path="editar/:id" element={<OrdemServicoDetalhe />} />
                                    <Route path=":id" element={<OrdemServicoDetalhe />} />
                                </Route>

                                {/* Estoque */}
                                <Route path="estoque">
                                    <Route index element={<Estoque />} />
                                    <Route path="novo" element={<EstoqueDetalhe />} />
                                    <Route path="editar/:id" element={<EstoqueDetalhe />} />
                                    <Route path=":id" element={<EstoqueDetalhe />} />
                                    <Route path="fornecedores">
                                        <Route index element={<Fornecedores />} />
                                        <Route path="novo" element={<FornecedorDetalhe />} />
                                        <Route path="editar/:id" element={<FornecedorDetalhe />} />
                                        <Route path=":id" element={<FornecedorDetalhe />} />
                                    </Route>
                                    <Route path="movimentacoes" element={<Movimentacoes />} />
                                </Route>

                                {/* Financeiro */}
                                <Route path="financeiro">
                                    <Route index element={<FinanceiroDashboard />} />
                                    <Route path="contas-receber" element={<ContasReceber />} />
                                    <Route path="contas-receber/nova" element={<ContaReceberDetalhe />} />
                                    <Route path="contas-receber/editar/:id" element={<ContaReceberDetalhe />} />
                                    <Route path="contas-receber/:id" element={<ContaReceberDetalhe />} />
                                    <Route path="contas-pagar" element={<ContasPagar />} />
                                    <Route path="contas-pagar/nova" element={<ContaPagarDetalhe />} />
                                    <Route path="contas-pagar/editar/:id" element={<ContaPagarDetalhe />} />
                                    <Route path="contas-pagar/:id" element={<ContaPagarDetalhe />} />
                                    <Route path="relatorios" element={<RelatorioFinanceiro />} />
                                </Route>

                                {/* Relatórios gerais (com abas) */}
                                <Route path="relatorios" element={<Relatorios />}>
                                    <Route index element={<Navigate to="financeiro" replace />} />
                                    <Route path="financeiro" element={<RelatorioFinanceiro />} />
                                    <Route path="os" element={<RelatorioOS />} />
                                    <Route path="servicos" element={<RelatorioServicos />} />
                                    <Route path="estoque" element={<RelatorioEstoque />} />
                                </Route>

                                {/* Configurações */}
                                <Route path="configuracoes" element={<Configuracoes />}>
                                    <Route index element={<Navigate to="usuarios" replace />} />
                                    <Route path="usuarios">
                                        <Route index element={<Usuarios />} />
                                        <Route path="novo" element={<UsuarioDetalhe />} />
                                        <Route path="editar/:id" element={<UsuarioDetalhe />} />
                                        <Route path=":id" element={<UsuarioDetalhe />} />
                                    </Route>
                                    <Route path="perfis">
                                        <Route index element={<Perfis />} />
                                        <Route path="novo" element={<PerfilDetalhe />} />
                                        <Route path="editar/:id" element={<PerfilDetalhe />} />
                                        <Route path=":id" element={<PerfilDetalhe />} />
                                    </Route>
                                    <Route path="empresa" element={<EmpresaConfig />} />
                                </Route>
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;