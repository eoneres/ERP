import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiEye, FiPackage, FiTruck, FiFileText } from "react-icons/fi";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/formatters";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import toast from "react-hot-toast";

export default function Estoque() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPeca, setSelectedPeca] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["estoque", page, debouncedSearch, filtroEstoqueBaixo],
    queryFn: () => estoqueAPI.listarPecas({
      page,
      search: debouncedSearch,
      estoqueBaixo: filtroEstoqueBaixo
    }),
  });

  const pecas = data?.data || [];
  const pagination = data?.pagination;

  const getStatusColor = (status) => {
    switch (status) {
      case 'BAIXO': return 'bg-yellow-100 text-yellow-800';
      case 'SEM_ESTOQUE': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'BAIXO': return 'Estoque Baixo';
      case 'SEM_ESTOQUE': return 'Sem Estoque';
      default: return 'Normal';
    }
  };

  const handleDeleteClick = (peca) => {
    setSelectedPeca(peca);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await estoqueAPI.deletarPeca(selectedPeca.id);
      toast.success("Peça excluída!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir");
    } finally {
      setShowDeleteDialog(false);
      setSelectedPeca(null);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "Código", accessor: "codigo" },
      { header: "Descrição", accessor: "descricao" },
      { header: "Marca", accessor: "marca" },
      { header: "Estoque Atual", accessor: "estoqueAtual" },
      { header: "Estoque Mínimo", accessor: "estoqueMinimo" },
      { header: "Preço Custo", accessor: "precoCusto", formatter: formatCurrency },
      { header: "Preço Venda", accessor: "precoVenda", formatter: formatCurrency },
      { header: "Status", accessor: "statusEstoque", formatter: getStatusLabel }
    ];
    exportToExcel(pecas, "estoque", columns);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Código", accessor: "codigo" },
      { header: "Descrição", accessor: "descricao" },
      { header: "Marca", accessor: "marca" },
      { header: "Estoque Atual", accessor: "estoqueAtual" },
      { header: "Estoque Mínimo", accessor: "estoqueMinimo" },
      { header: "Preço Custo", accessor: "precoCusto", formatter: formatCurrency },
      { header: "Preço Venda", accessor: "precoVenda", formatter: formatCurrency },
      { header: "Status", accessor: "statusEstoque", formatter: getStatusLabel }
    ];
    exportToPDF(pecas, "Relatório de Estoque", "estoque", columns);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estoque</h1>
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
          <Link to="/estoque/fornecedores" className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700">
            <FiTruck /> Fornecedores
          </Link>
          <Link to="/estoque/novo" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
            <FiPlus /> Nova Peça
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código ou descrição..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filtroEstoqueBaixo}
              onChange={(e) => setFiltroEstoqueBaixo(e.target.checked)}
              className="rounded text-primary-600"
            />
            <span className="text-sm">Apenas estoque baixo</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {pecas.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pecas.map((peca) => (
                <tr key={peca.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{peca.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div>{peca.descricao}</div>
                      {peca.marca && <div className="text-xs text-gray-500">{peca.marca}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{peca.estoqueAtual}</span>
                    {peca.estoqueMinimo > 0 && (
                      <span className="text-xs text-gray-500 ml-1">/ min {peca.estoqueMinimo}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(peca.precoVenda)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(peca.statusEstoque)}`}>
                      {getStatusLabel(peca.statusEstoque)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <Link to={`/estoque/${peca.id}`} className="text-blue-600 hover:text-blue-900">
                        <FiEye size={18} />
                      </Link>
                      <Link to={`/estoque/editar/${peca.id}`} className="text-green-600 hover:text-green-900">
                        <FiEdit2 size={18} />
                      </Link>
                      <button onClick={() => handleDeleteClick(peca)} className="text-red-600 hover:text-red-900">
                        <FiPackage size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-500">Nenhuma peça encontrada</p>
          </div>
        )}
      </div>

      {pagination?.pages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Peça"
        message={`Excluir ${selectedPeca?.descricao}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}