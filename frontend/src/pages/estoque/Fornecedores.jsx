import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiEye, FiTruck, FiTrash2 } from "react-icons/fi";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export default function Fornecedores() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedFornecedor, setSelectedFornecedor] = useState(null);

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["fornecedores", page, debouncedSearch],
        queryFn: () => estoqueAPI.listarFornecedores({
            page,
            search: debouncedSearch,
            limit: 10
        }),
    });

    const fornecedores = data?.data || [];
    const pagination = data?.pagination;

    const handleDeleteClick = (fornecedor) => {
        setSelectedFornecedor(fornecedor);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await estoqueAPI.deletarFornecedor(selectedFornecedor.id);
            toast.success("Fornecedor excluído!");
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao excluir");
        } finally {
            setShowDeleteDialog(false);
            setSelectedFornecedor(null);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Fornecedores</h1>
                <Link
                    to="/estoque/fornecedores/novo"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                >
                    <FiPlus /> Novo Fornecedor
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por razão social ou CNPJ..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {fornecedores.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razão Social</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peças</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fornecedores.map((f) => (
                                <tr key={f.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{f.razaoSocial}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{f.cnpj}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{f.telefone1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{f._count?.pecas || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${f.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {f.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <Link to={`/estoque/fornecedores/${f.id}`} className="text-blue-600 hover:text-blue-900">
                                                <FiEye size={18} />
                                            </Link>
                                            <Link to={`/estoque/fornecedores/editar/${f.id}`} className="text-green-600 hover:text-green-900">
                                                <FiEdit2 size={18} />
                                            </Link>
                                            <button onClick={() => handleDeleteClick(f)} className="text-red-600 hover:text-red-900">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <FiTruck className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Nenhum fornecedor encontrado</p>
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
                title="Excluir Fornecedor"
                message={`Excluir ${selectedFornecedor?.razaoSocial}?`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}