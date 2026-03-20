import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const tabs = [
  { name: "Financeiro", path: "/relatorios/financeiro", component: "Financeiro" },
  { name: "Ordens de Serviço", path: "/relatorios/os", component: "OS" },
  { name: "Serviços", path: "/relatorios/servicos", component: "Servicos" },
  { name: "Estoque", path: "/relatorios/estoque", component: "Estoque" }
];

export default function Relatorios() {
  const location = useLocation();
  const activeTab = tabs.find(tab => location.pathname === tab.path) || tabs[0];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${location.pathname === tab.path
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Conteúdo da aba ativa */}
      <Outlet />
    </div>
  );
}