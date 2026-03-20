import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeiroAPI } from "../../services/api/financeiro";
import { relatoriosAPI } from "../../services/api/relatorios";
import Loading from "../../components/ui/Loading";
import RevenueLineChart from "../../components/charts/LineChart";
import StatusPieChart from "../../components/charts/PieChart";
import TopServicesBarChart from "../../components/charts/BarChart";
import { formatCurrency } from "../../utils/formatters";

export default function Dashboard() {
    const [ano, setAno] = useState(new Date().getFullYear());

    // Dados do dashboard existente
    const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
        queryKey: ["financeiro-dashboard"],
        queryFn: () => financeiroAPI.getDashboard()
    });

    // Receitas mensais
    const { data: revenueData, isLoading: loadingRevenue } = useQuery({
        queryKey: ["monthly-revenue", ano],
        queryFn: () => financeiroAPI.getMonthlyRevenue(ano),
        enabled: true
    });

    // Dados de OS para o gráfico de status (usando o relatório do mês atual)
    const { data: osData, isLoading: loadingOS } = useQuery({
        queryKey: ["relatorio-os", ano],
        queryFn: () => relatoriosAPI.getRelatorioOS(
            `${ano}-01-01`,
            `${ano}-12-31`
        ),
        enabled: true
    });

    // Top serviços
    const { data: topServicesData, isLoading: loadingTop } = useQuery({
        queryKey: ["top-servicos", ano],
        queryFn: () => relatoriosAPI.getTopServicos(
            `${ano}-01-01`,
            `${ano}-12-31`,
            5
        ),
        enabled: true
    });

    if (loadingDashboard || loadingRevenue || loadingOS || loadingTop) return <Loading />;

    const dashboard = dashboardData?.data || {};
    const monthlyRevenue = revenueData?.data?.dados || [];
    const osStatusRaw = osData?.data?.porStatus || {};
    const statusData = Object.entries(osStatusRaw).map(([name, value]) => ({ name, value }));
    const topServices = topServicesData?.data || [];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Seletor de ano */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Ano:</label>
                    <select
                        value={ano}
                        onChange={(e) => setAno(parseInt(e.target.value))}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value={2023}>2023</option>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
            </div>

            {/* Cards de resumo existentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Contas a Receber (Mês)</h3>
                    <p className="text-2xl font-bold">{dashboard.contasReceberMes || 0}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        <span className="text-green-600 font-medium">{formatCurrency(dashboard.totalRecebidoMes || 0)}</span> recebido
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">Contas a Pagar (Mês)</h3>
                    <p className="text-2xl font-bold">{dashboard.contasPagarMes || 0}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        <span className="text-red-600 font-medium">{formatCurrency(dashboard.totalPagoMes || 0)}</span> pago
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">A Receber Atrasado</h3>
                    <p className="text-2xl font-bold">{dashboard.aReceberAtrasado || 0}</p>
                    <p className="text-sm text-orange-600 mt-2">clientes pendentes</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm">A Pagar Atrasado</h3>
                    <p className="text-2xl font-bold">{dashboard.aPagarAtrasado || 0}</p>
                    <p className="text-sm text-red-600 mt-2">fornecedores pendentes</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RevenueLineChart data={monthlyRevenue} title={`Receitas Mensais - ${ano}`} />
                <StatusPieChart data={statusData} title="Ordens de Serviço por Status" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <TopServicesBarChart data={topServices} title="Top 5 Serviços Mais Executados" />
            </div>
        </div>
    );
}