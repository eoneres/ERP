import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { relatoriosAPI } from "../../services/api/relatorios";
import Loading from "../../components/ui/Loading";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { FiFileText } from "react-icons/fi";

export default function RelatorioOS() {
    const [periodo, setPeriodo] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["relatorio-os", periodo],
        queryFn: () => relatoriosAPI.getRelatorioOS(periodo.dataInicio, periodo.dataFim),
        enabled: !!periodo.dataInicio && !!periodo.dataFim
    });

    if (isLoading) return <Loading />;

    const relatorio = data?.data || {};
    const ordens = relatorio.ordens || [];

    const handleExportExcel = () => {
        const columns = [
            { header: "Nº", accessor: "numero" },
            { header: "Cliente", accessor: (item) => item.cliente?.nome || "-" },
            { header: "Abertura", accessor: "dataAbertura", formatter: formatDate },
            { header: "Status", accessor: "status" },
            { header: "Valor", accessor: (item) => formatCurrency((item.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (item.pecas?.reduce((a, b) => a + b.total, 0) || 0)) }
        ];
        exportToExcel(ordens, "relatorio-os", columns);
    };

    const handleExportPDF = () => {
        const columns = [
            { header: "Nº", accessor: "numero" },
            { header: "Cliente", accessor: (item) => item.cliente?.nome || "-" },
            { header: "Abertura", accessor: "dataAbertura", formatter: formatDate },
            { header: "Status", accessor: "status" },
            { header: "Valor", accessor: (item) => formatCurrency((item.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (item.pecas?.reduce((a, b) => a + b.total, 0) || 0)) }
        ];
        exportToPDF(ordens, `Relatório de OS - ${periodo.dataInicio} a ${periodo.dataFim}`, "relatorio-os", columns);
    };

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
                    <div className="flex gap-2">
                        <button
                            onClick={() => refetch()}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Atualizar
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                        >
                            <FiFileText /> Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                        >
                            <FiFileText /> PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total de OS</h3>
                    <p className="text-2xl font-bold">{relatorio.totalOS || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Valor Total</h3>
                    <p className="text-2xl font-bold">{formatCurrency(relatorio.totalValor || 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Recebido</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(relatorio.totalRecebido || 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">A Receber</h3>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency((relatorio.totalValor || 0) - (relatorio.totalRecebido || 0))}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Status das OS</h2>
                <div className="space-y-2">
                    {Object.entries(relatorio.porStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                            <span className="capitalize">{status.toLowerCase()}</span>
                            <span className="font-medium">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-lg font-semibold p-6 pb-2">Lista de OS</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abertura</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordens.map((os) => (
                            <tr key={os.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{os.numero}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{os.cliente?.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(os.dataAbertura)}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{os.status.toLowerCase()}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {formatCurrency((os.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (os.pecas?.reduce((a, b) => a + b.total, 0) || 0))}
                                </td>
                            </tr>
                        ))}
                        {ordens.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma OS no período
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}