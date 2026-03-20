import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiLock } from "react-icons/fi";
import { perfisAPI } from "../../services/api/perfis";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function Perfis() {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["perfis"],
        queryFn: () => perfisAPI.listar(),
    });

    const perfis = data?.data || [];

    const deleteMutation = useMutation({
        mutationFn: (id) => perfisAPI.deletar(id),
        onSuccess: () => {
            refetch();
            toast.success("Perfil excluído!");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const handleDeleteClick = (perfil) => {
        setSelectedPerfil(perfil);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedPerfil.id);
        setShowDeleteDialog(false);
        setSelectedPerfil(null);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Perfis de Acesso</h1>
                <Link
                    to="/configuracoes/perfis/novo"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                >
                    <FiPlus /> Novo Perfil
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {perfis.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuários</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {perfis.map((perfil) => (
                                <tr key={perfil.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{perfil.nome}</td>
                                    <td className="px-6 py-4">{perfil.descricao || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{perfil._count?.usuarios || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <Link to={`/configuracoes/perfis/${perfil.id}`} className="text-blue-600 hover:text-blue-900">
                                                <FiLock size={18} />
                                            </Link>
                                            <Link to={`/configuracoes/perfis/editar/${perfil.id}`} className="text-green-600 hover:text-green-900">
                                                <FiEdit2 size={18} />
                                            </Link>
                                            {perfil.nome !== 'ADMIN' && perfil.nome !== 'ATENDENTE' && perfil.nome !== 'MECANICO' && (
                                                <button
                                                    onClick={() => handleDeleteClick(perfil)}
                                                    className="text-red-600 hover:text-red-900"
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
                ) : (
                    <div className="text-center py-12">
                        <FiLock className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Nenhum perfil encontrado</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Excluir Perfil"
                message={`Tem certeza que deseja excluir o perfil ${selectedPerfil?.nome}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}