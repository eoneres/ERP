import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { relatoriosAPI } from "../../services/api/relatorios";
import Loading from "../../components/ui/Loading";
import { formatDate } from "../../utils/formatters";

export default function RelatorioEstoque() {
    const [periodo, setPeriodo] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["relatorio-estoque", periodo],
        queryFn: () => relatoriosAPI.getRelatorioEstoque(periodo.dataInicio, periodo.dataFim),
        enabled: !!periodo.dataInicio && !!periodo.dataFim
    });

    if (isLoading) return <Loading />;

    const relatorio = data?.data || {};

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
                    <button
                        onClick={() => refetch()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Entradas</h3>
                    <p className="text-2xl font-bold text-green-600">{relatorio.totalEntradas || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Saídas</h3>
                    <p className="text-2xl font-bold text-red-600">{relatorio.totalSaidas || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Ajustes</h3>
                    <p className="text-2xl font-bold text-yellow-600">{relatorio.totalAjustes || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-lg font-semibold p-6 pb-2">Movimentações</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peça</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...(relatorio.entradas || []), ...(relatorio.saidas || []), ...(relatorio.ajustes || [])]
                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                            .map((mov) => (
                                <tr key={mov.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(mov.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mov.peca?.codigo} - {mov.peca?.descricao}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' : mov.tipo === 'SAIDA' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mov.quantidade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mov.motivo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mov.usuario?.nome || '-'}</td>
                                </tr>
                            ))}
                        {(!relatorio.entradas?.length && !relatorio.saidas?.length && !relatorio.ajustes?.length) && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma movimentação no período
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}