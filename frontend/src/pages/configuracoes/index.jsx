import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const tabs = [
  { name: "Usuários", path: "/configuracoes/usuarios" },
  { name: "Perfis", path: "/configuracoes/perfis" },
  { name: "Empresa", path: "/configuracoes/empresa" }
];

export default function Configuracoes() {
  const location = useLocation();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

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

      <Outlet />
    </div>
  );
}