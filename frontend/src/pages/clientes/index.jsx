import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiFileText } from "react-icons/fi";
import { clientesAPI } from "../../services/api/clientes";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDocument, formatPhone } from "../../utils/formatters";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import toast from "react-hot-toast";

export default function Clientes() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [tipo, setTipo] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, nome: "" });
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["clientes", page, debouncedSearch, tipo],
        queryFn: () => clientesAPI.listar({
            page,
            search: debouncedSearch,
            tipo
        }),
        keepPreviousData: true,
    });

    const clientes = data?.data || [];
    const pagination = data?.pagination;

    const handleDeleteClick = (id, nome) => {
        setDeleteConfirm({ show: true, id, nome });
    };

    const handleDeleteConfirm = async () => {
        const { id, nome } = deleteConfirm;
        try {
            await clientesAPI.deletar(id);
            toast.success(`Cliente ${nome} excluído com sucesso!`);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao excluir cliente");
        } finally {
            setDeleteConfirm({ show: false, id: null, nome: "" });
        }
    };

    const handleExportExcel = () => {
        const columns = [
            { header: "Nome", accessor: "nome" },
            { header: "Documento", accessor: "documento", formatter: formatDocument },
            { header: "Telefone", accessor: "telefone1", formatter: formatPhone },
            { header: "E-mail", accessor: "email" },
            { header: "Tipo", accessor: "tipo", formatter: (val) => val === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica" },
            { header: "Status", accessor: "ativo", formatter: (val) => val ? "Ativo" : "Inativo" }
        ];
        exportToExcel(clientes, "clientes", columns);
    };

    const handleExportPDF = () => {
        const columns = [
            { header: "Nome", accessor: "nome" },
            { header: "Documento", accessor: "documento", formatter: formatDocument },
            { header: "Telefone", accessor: "telefone1", formatter: formatPhone },
            { header: "E-mail", accessor: "email" },
            { header: "Tipo", accessor: "tipo", formatter: (val) => val === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica" },
            { header: "Status", accessor: "ativo", formatter: (val) => val ? "Ativo" : "Inativo" }
        ];
        exportToPDF(clientes, "Relatório de Clientes", "clientes", columns);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
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
                        to="/clientes/novo"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                    >
                        <FiPlus /> Novo Cliente
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, documento ou e-mail..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-48 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="FISICA">Pessoa Física</option>
                        <option value="JURIDICA">Pessoa Jurídica</option>
                    </select>
                </div>
            </div>

            {/* Lista de Clientes */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {clientes.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cliente.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDocument(cliente.documento)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{cliente.email || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatPhone(cliente.telefone1)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${cliente.tipo === 'FISICA' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {cliente.tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-3">
                                                    <Link to={`/clientes/${cliente.id}`} className="text-blue-600 hover:text-blue-900" title="Ver detalhes">
                                                        <FiUser size={18} />
                                                    </Link>
                                                    <Link to={`/clientes/editar/${cliente.id}`} className="text-green-600 hover:text-green-900" title="Editar">
                                                        <FiEdit2 size={18} />
                                                    </Link>
                                                    {cliente.ativo && (
                                                        <button onClick={() => handleDeleteClick(cliente.id, cliente.nome)} className="text-red-600 hover:text-red-900" title="Excluir">
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

                        {pagination && pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t">
                                <Pagination
                                    currentPage={page}
                                    totalPages={pagination.pages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <FiUser className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {search || tipo ? 'Tente ajustar os filtros' : 'Comece cadastrando um novo cliente'}
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                title="Excluir Cliente"
                message={`Deseja realmente excluir o cliente ${deleteConfirm.nome}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ show: false, id: null, nome: '' })}
                type="danger"
            />
        </div>
    );
}
