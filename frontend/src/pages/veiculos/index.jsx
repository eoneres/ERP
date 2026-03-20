import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiTruck
} from "react-icons/fi";
import { veiculosAPI } from "../../services/api/veiculos";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export default function Veiculos() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["veiculos", page, debouncedSearch, filtroMarca],
    queryFn: () => veiculosAPI.listar({
      page,
      search: debouncedSearch,
      marca: filtroMarca
    }),
  });

  console.log("📊 Dados recebidos:", data);
  console.log("⏳ Carregando:", isLoading);
  console.log("❌ Erro:", null);

  const veiculos = data?.data || [];
  const pagination = data?.pagination;

  const handleDeleteClick = (veiculo) => {
    setSelectedVeiculo(veiculo);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await veiculosAPI.deletar(selectedVeiculo.id);
      toast.success("Veículo excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir veículo");
    } finally {
      setShowDeleteDialog(false);
      setSelectedVeiculo(null);
    }
  };

  // Extrair marcas únicas para o filtro
  const marcas = [...new Set(veiculos.map(v => v.marca).filter(Boolean))].sort();

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Veículos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie todos os veículos dos clientes
          </p>
        </div>
        <Link
          to="/veiculos/novo"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <FiPlus /> Novo Veículo
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por placa, marca, modelo..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {marcas.map(marca => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Veículos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {veiculos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {veiculo.placa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {veiculo.marca} {veiculo.modelo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {veiculo.cor || "N/I"} • {veiculo.combustivel || "N/I"} • {veiculo.cambio || "N/I"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {veiculo.clienteNome || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {veiculo.anoFabricacao || "—"}/{veiculo.anoModelo || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {veiculo.kmAtual?.toLocaleString() || "0"} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={veiculo.ativo ? "ATIVO" : "INATIVO"} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        {/* Visualizar */}
                        <Link
                          to={`/veiculos/${veiculo.id}`}  // ✅ Isso leva para visualização
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <FiEye size={18} />
                        </Link>

                        {/* Editar */}
                        <Link
                          to={`/veiculos/editar/${veiculo.id}`}  // ✅ Isso leva para edição
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </Link>

                        {/* Excluir (só se ativo) */}
                        {veiculo.ativo && (
                          <button
                            onClick={() => handleDeleteClick(veiculo)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTruck className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">Nenhum veículo encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || filtroMarca ? 'Tente ajustar os filtros' : 'Comece cadastrando um novo veículo'}
            </p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o veículo ${selectedVeiculo?.placa}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedVeiculo(null);
        }}
        type="danger"
      />
    </div>
  );
}