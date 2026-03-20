import React, { useState } from "react";

export default function StatusBadge({ status }) {
    const colors = {
        // Status de OS
        ABERTA: "bg-blue-100 text-blue-800",
        AGUARDANDO_APROVACAO: "bg-yellow-100 text-yellow-800",
        APROVADA: "bg-green-100 text-green-800",
        EM_EXECUCAO: "bg-purple-100 text-purple-800",
        CONCLUIDA: "bg-indigo-100 text-indigo-800",
        ENTREGUE: "bg-green-100 text-green-800",
        CANCELADA: "bg-red-100 text-red-800",

        // Status de serviço
        PENDENTE: "bg-yellow-100 text-yellow-800",
        CONCLUIDO: "bg-green-100 text-green-800",

        // Status financeiro
        PAGO: "bg-green-100 text-green-800",
        PARCIAL: "bg-blue-100 text-blue-800",
        ATRASADO: "bg-red-100 text-red-800",

        // Default
        default: "bg-gray-100 text-gray-800",
    };

    const labels = {
        ABERTA: "Aberta",
        AGUARDANDO_APROVACAO: "Aguardando Aprovação",
        APROVADA: "Aprovada",
        EM_EXECUCAO: "Em Execução",
        CONCLUIDA: "Concluída",
        ENTREGUE: "Entregue",
        CANCELADA: "Cancelada",
        PENDENTE: "Pendente",
        CONCLUIDO: "Concluído",
        PAGO: "Pago",
        PARCIAL: "Parcial",
        ATRASADO: "Atrasado",
        default: status,
    };

    const colorClass = colors[status] || colors.default;
    const label = labels[status] || labels.default;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
        >
            {label}
        </span>
    );
}