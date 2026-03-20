import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEye, FiEdit2, FiDollarSign, FiFileText } from "react-icons/fi";
import { financeiroAPI } from "../../services/api/financeiro";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

export default function ContasReceber() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading } = useQuery({
        queryKey: ["contas-receber", page, debouncedSearch, status],
        queryFn: () => financeiroAPI.listarContasReceber({
            page,
            search: debouncedSearch,
            status: status || undefined,
            limit: 10
        })
    });

    const contas = data?.data || [];
    const pagination = data?.pagination;

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
            case 'PARCIAL': return 'bg-blue-100 text-blue-800';
            case 'PAGO': return 'bg-green-100 text-green-800';
            case 'CANCELADO': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleExportExcel = () => {
        const columns = [
            { header: "OS", accessor: (item) => item.ordemServico?.numero || "-" },
            { header: "Cliente", accessor: (item) => item.ordemServico?.cliente?.nome || "-" },
            { header: "Vencimento", accessor: "dataVencimento", formatter: formatDate },
            { header: "Valor", accessor: "valorTotal", formatter: formatCurrency },
            { header: "Pago", accessor: "valorPago", formatter: formatCurrency },
            { header: "Status", accessor: "status" }
        ];
        exportToExcel(contas, "contas-receber", columns);
    };

    const handleExportPDF = () => {
        const columns = [
            { header: "OS", accessor: (item) => item.ordemServico?.numero || "-" },
            { header: "Cliente", accessor: (item) => item.ordemServico?.cliente?.nome || "-" },
            { header: "Vencimento", accessor: "dataVencimento", formatter: formatDate },
            { header: "Valor", accessor: "valorTotal", formatter: formatCurrency },
            { header: "Pago", accessor: "valorPago", formatter: formatCurrency },
            { header: "Status", accessor: "status" }
        ];
        exportToPDF(contas, "Contas a Receber", "contas-receber", columns);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Contas a Receber</h1>
                <div className="flex gap-3">
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
                    <Link
                        to="/financeiro/contas-receber/nova"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                    >
                        <FiPlus /> Nova Conta
                    </Link>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por OS ou cliente..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Todos os status</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="PAGO">Pago</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {contas.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contas.map((conta) => (
                                <tr key={conta.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {conta.ordemServico?.numero || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {conta.ordemServico?.cliente?.nome || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(conta.dataVencimento)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {formatCurrency(conta.valorTotal)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatCurrency(conta.valorPago)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conta.status)}`}>
                                            {conta.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <Link to={`/financeiro/contas-receber/${conta.id}`} className="text-blue-600 hover:text-blue-900">
                                                <FiEye size={18} />
                                            </Link>
                                            {conta.status !== 'PAGO' && conta.status !== 'CANCELADO' && (
                                                <Link to={`/financeiro/contas-receber/editar/${conta.id}`} className="text-green-600 hover:text-green-900">
                                                    <FiEdit2 size={18} />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <FiDollarSign className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Nenhuma conta a receber encontrada</p>
                    </div>
                )}
            </div>

            {pagination?.pages > 1 && (
                <div className="mt-4">
                    <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
                </div>
            )}
        </div>
    );
}