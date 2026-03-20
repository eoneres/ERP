import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEye, FiEdit2, FiFileText } from "react-icons/fi";
import { ordensServicoAPI } from "../../services/api/ordensServico";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

export default function OrdensServico() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["ordens-servico", page, debouncedSearch, status],
    queryFn: () => ordensServicoAPI.listar({
      page,
      search: debouncedSearch,
      status: status || undefined,
      limit: 10
    })
  });

  const ordens = data?.data || [];
  const pagination = data?.pagination;

  const handleExportExcel = () => {
    const columns = [
      { header: "Nº", accessor: "numero" },
      { header: "Cliente", accessor: (item) => item.cliente?.nome || "-" },
      { header: "Veículo", accessor: (item) => `${item.veiculo?.placa || ""} ${item.veiculo?.marca || ""} ${item.veiculo?.modelo || ""}`.trim() || "-" },
      { header: "Abertura", accessor: "dataAbertura", formatter: formatDate },
      { header: "Status", accessor: "status" },
      { header: "Total", accessor: (item) => formatCurrency((item.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (item.pecas?.reduce((a, b) => a + b.total, 0) || 0)) }
    ];
    exportToExcel(ordens, "ordens-servico", columns);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Nº", accessor: "numero" },
      { header: "Cliente", accessor: (item) => item.cliente?.nome || "-" },
      { header: "Veículo", accessor: (item) => `${item.veiculo?.placa || ""} ${item.veiculo?.marca || ""} ${item.veiculo?.modelo || ""}`.trim() || "-" },
      { header: "Abertura", accessor: "dataAbertura", formatter: formatDate },
      { header: "Status", accessor: "status" },
      { header: "Total", accessor: (item) => formatCurrency((item.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (item.pecas?.reduce((a, b) => a + b.total, 0) || 0)) }
    ];
    exportToPDF(ordens, "Relatório de Ordens de Serviço", "ordens-servico", columns);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
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
            to="/os/nova"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <FiPlus /> Nova OS
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número ou cliente..."
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
            <option value="ABERTA">Aberta</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="APROVADA">Aprovada</option>
            <option value="EM_EXECUCAO">Em Execução</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {ordens.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abertura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordens.map((os) => (
                <tr key={os.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{os.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{os.cliente?.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {os.veiculo?.placa} - {os.veiculo?.marca} {os.veiculo?.modelo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(os.dataAbertura)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={os.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency((os.servicos?.reduce((a, b) => a + b.total, 0) || 0) + (os.pecas?.reduce((a, b) => a + b.total, 0) || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <Link to={`/os/${os.id}`} className="text-blue-600 hover:text-blue-900">
                        <FiEye size={18} />
                      </Link>
                      <Link to={`/os/editar/${os.id}`} className="text-green-600 hover:text-green-900">
                        <FiEdit2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma ordem de serviço encontrada</p>
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