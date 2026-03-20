import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeiroAPI } from "../../services/api/financeiro";
import Loading from "../../components/ui/Loading";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function RelatoriosFinanceiro() {
    const [periodo, setPeriodo] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["relatorio-financeiro", periodo],
        queryFn: () => financeiroAPI.getRelatorio(periodo.dataInicio, periodo.dataFim),
        enabled: !!periodo.dataInicio && !!periodo.dataFim
    });

    if (isLoading) return <Loading />;

    const relatorio = data?.data || {};

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Relatório Financeiro</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
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
                        Gerar Relatório
                    </button>
                </div>
            </div>

            {relatorio.resumo && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">Receitas</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Previstas:</span>
                                    <span className="font-medium">{formatCurrency(relatorio.resumo.receitas.previstas)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Realizadas:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(relatorio.resumo.receitas.realizadas)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span>A receber:</span>
                                    <span className="font-medium text-orange-600">
                                        {formatCurrency(relatorio.resumo.receitas.previstas - relatorio.resumo.receitas.realizadas)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">Despesas</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Previstas:</span>
                                    <span className="font-medium">{formatCurrency(relatorio.resumo.despesas.previstas)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Realizadas:</span>
                                    <span className="font-medium text-red-600">{formatCurrency(relatorio.resumo.despesas.realizadas)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span>A pagar:</span>
                                    <span className="font-medium text-red-600">
                                        {formatCurrency(relatorio.resumo.despesas.previstas - relatorio.resumo.despesas.realizadas)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="text-lg font-semibold p-6 pb-2">Lançamentos do Período</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {relatorio.lancamentos?.map((l) => (
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(l.dataVencimento)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${l.tipo === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {l.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {l.tipo === 'RECEITA'
                                                ? `OS ${l.ordemServico?.numero} - ${l.ordemServico?.cliente?.nome}`
                                                : l.descricao}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {formatCurrency(l.valorTotal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${l.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                                                    l.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                        l.status === 'PARCIAL' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!relatorio.lancamentos || relatorio.lancamentos.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            Nenhum lançamento no período
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}