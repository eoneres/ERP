import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiUser, FiUserCheck, FiUserX } from "react-icons/fi";
import { usuariosAPI } from "../../services/api/usuarios";
import { perfisAPI } from "../../services/api/perfis";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export default function Usuarios() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [perfilId, setPerfilId] = useState("");
    const [showToggleDialog, setShowToggleDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const debouncedSearch = useDebounce(search, 500);

    // Buscar lista de perfis para o filtro
    const { data: perfisData } = useQuery({
        queryKey: ["perfis-select"],
        queryFn: () => perfisAPI.listar(),
    });
    const perfis = perfisData?.data || [];

    // Buscar usuários
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["usuarios", page, debouncedSearch, perfilId],
        queryFn: () => usuariosAPI.listar({
            page,
            search: debouncedSearch,
            perfilId: perfilId || undefined,
            limit: 10
        }),
    });

    const usuarios = data?.data || [];
    const pagination = data?.pagination;

    const handleToggleStatus = async (usuario) => {
        setSelectedUser(usuario);
        setShowToggleDialog(true);
    };

    const confirmToggle = async () => {
        try {
            await usuariosAPI.toggleStatus(selectedUser.id);
            toast.success(selectedUser.ativo ? "Usuário desativado!" : "Usuário ativado!");
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao alterar status");
        } finally {
            setShowToggleDialog(false);
            setSelectedUser(null);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Usuários</h1>
                <Link
                    to="/configuracoes/usuarios/novo"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                >
                    <FiPlus /> Novo Usuário
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        value={perfilId}
                        onChange={(e) => setPerfilId(e.target.value)}
                    >
                        <option value="">Todos os perfis</option>
                        {perfis.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {usuarios.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.telefone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.perfil?.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <Link to={`/configuracoes/usuarios/${user.id}`} className="text-blue-600 hover:text-blue-900">
                                                <FiUser size={18} />
                                            </Link>
                                            <Link to={`/configuracoes/usuarios/editar/${user.id}`} className="text-green-600 hover:text-green-900">
                                                <FiEdit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`${user.ativo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                title={user.ativo ? "Desativar" : "Ativar"}
                                            >
                                                {user.ativo ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <FiUser className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Nenhum usuário encontrado</p>
                    </div>
                )}
            </div>

            {pagination?.pages > 1 && (
                <div className="mt-4">
                    <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
                </div>
            )}

            <ConfirmDialog
                isOpen={showToggleDialog}
                title={selectedUser?.ativo ? "Desativar Usuário" : "Ativar Usuário"}
                message={`Tem certeza que deseja ${selectedUser?.ativo ? "desativar" : "ativar"} o usuário ${selectedUser?.nome}?`}
                confirmText={selectedUser?.ativo ? "Desativar" : "Ativar"}
                cancelText="Cancelar"
                onConfirm={confirmToggle}
                onCancel={() => setShowToggleDialog(false)}
                type="warning"
            />
        </div>
    );
}