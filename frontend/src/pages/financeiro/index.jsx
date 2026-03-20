import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import { financeiroAPI } from "../../services/api/financeiro";
import Loading from "../../components/ui/Loading";
import { formatCurrency } from "../../utils/formatters";

export default function FinanceiroDashboard() {
  const [periodo, setPeriodo] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });

  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ["financeiro-dashboard"],
    queryFn: () => financeiroAPI.getDashboard()
  });

  const { data: fluxoData, isLoading: loadingFluxo } = useQuery({
    queryKey: ["financeiro-fluxo", periodo],
    queryFn: () => financeiroAPI.getFluxoCaixa(periodo.dataInicio, periodo.dataFim),
    enabled: !!periodo.dataInicio && !!periodo.dataFim
  });

  if (loadingDashboard || loadingFluxo) return <Loading />;

  const dashboard = dashboardData?.data || {};
  const fluxo = fluxoData?.data || {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Financeiro</h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Contas a Receber (Mês)</h3>
            <FiTrendingUp className="text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold">{dashboard.contasReceberMes || 0}</p>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-green-600 font-medium">
              {formatCurrency(dashboard.totalRecebidoMes || 0)}
            </span> recebido
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Contas a Pagar (Mês)</h3>
            <FiTrendingDown className="text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold">{dashboard.contasPagarMes || 0}</p>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-red-600 font-medium">
              {formatCurrency(dashboard.totalPagoMes || 0)}
            </span> pago
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">A Receber Atrasado</h3>
            <FiAlertCircle className="text-orange-500 text-xl" />
          </div>
          <p className="text-2xl font-bold">{dashboard.aReceberAtrasado || 0}</p>
          <p className="text-sm text-orange-600 mt-2">clientes pendentes</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">A Pagar Atrasado</h3>
            <FiAlertCircle className="text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold">{dashboard.aPagarAtrasado || 0}</p>
          <p className="text-sm text-red-600 mt-2">fornecedores pendentes</p>
        </div>
      </div>

      {/* Seletor de período para fluxo de caixa */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Fluxo de Caixa</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="date"
              className="border rounded-lg px-4 py-2"
              value={periodo.dataInicio}
              onChange={(e) => setPeriodo({ ...periodo, dataInicio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input
              type="date"
              className="border rounded-lg px-4 py-2"
              value={periodo.dataFim}
              onChange={(e) => setPeriodo({ ...periodo, dataFim: e.target.value })}
            />
          </div>
        </div>

        {fluxo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(fluxo.totalReceitas || 0)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700 mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(fluxo.totalDespesas || 0)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${(fluxo.saldo || 0) >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className="text-sm text-gray-700 mb-1">Saldo</p>
              <p className={`text-2xl font-bold ${(fluxo.saldo || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatCurrency(fluxo.saldo || 0)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Links rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/financeiro/contas-receber" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <FiDollarSign className="text-green-600 text-3xl mb-2" />
          <h3 className="font-semibold text-lg">Contas a Receber</h3>
          <p className="text-sm text-gray-500">Gerencie os recebimentos de clientes</p>
        </Link>
        <Link to="/financeiro/contas-pagar" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <FiTrendingDown className="text-red-600 text-3xl mb-2" />
          <h3 className="font-semibold text-lg">Contas a Pagar</h3>
          <p className="text-sm text-gray-500">Gerencie as despesas e pagamentos</p>
        </Link>
        <Link to="/financeiro/relatorios" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <FiTrendingUp className="text-blue-600 text-3xl mb-2" />
          <h3 className="font-semibold text-lg">Relatórios</h3>
          <p className="text-sm text-gray-500">Análises e extratos financeiros</p>
        </Link>
      </div>
    </div>
  );
}