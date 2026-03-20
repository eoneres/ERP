import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { relatoriosAPI } from "../../services/api/relatorios";
import Loading from "../../components/ui/Loading";
import { formatCurrency } from "../../utils/formatters";

export default function RelatorioServicos() {
    const [periodo, setPeriodo] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });
    const [limit, setLimit] = useState(10);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["top-servicos", periodo, limit],
        queryFn: () => relatoriosAPI.getTopServicos(periodo.dataInicio, periodo.dataFim, limit),
        enabled: !!periodo.dataInicio && !!periodo.dataFim
    });

    if (isLoading) return <Loading />;

    const topServicos = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Mostrar top</label>
                        <select
                            className="border rounded-lg px-4 py-2"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-lg font-semibold p-6 pb-2">Serviços mais executados</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vezes executado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {topServicos.map((servico, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">{servico.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{servico.quantidade}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(servico.valor)}</td>
                            </tr>
                        ))}
                        {topServicos.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    Nenhum serviço no período
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}