import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiFileText } from "react-icons/fi";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import Pagination from "../../components/ui/Pagination";
import MovimentacaoModal from "./MovimentacaoModal";
import { formatDateTime } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

export default function Movimentacoes() {
    const [searchParams] = useSearchParams();
    const pecaParam = searchParams.get("peca");

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [tipo, setTipo] = useState("");
    const [pecaId, setPecaId] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [pecaSelecionada, setPecaSelecionada] = useState(null);

    const debouncedSearch = useDebounce(search, 500);

    const { data: pecasData } = useQuery({
        queryKey: ["pecas-select"],
        queryFn: () => estoqueAPI.listarPecas({ limit: 100 }),
    });
    const pecas = pecasData?.data || [];

    useEffect(() => {
        if (pecaParam && !modalAberto) {
            const peca = pecas.find(p => p.id === parseInt(pecaParam));
            if (peca) {
                setPecaSelecionada(peca);
                setModalAberto(true);
            }
        }
    }, [pecaParam, pecas, modalAberto]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["movimentacoes", page, debouncedSearch, tipo, pecaId],
        queryFn: () => estoqueAPI.listarMovimentacoes({
            page,
            search: debouncedSearch,
            tipo: tipo || undefined,
            pecaId: pecaId || undefined,
            limit: 10
        }),
    });

    const movimentacoes = data?.data || [];
    const pagination = data?.pagination;

    const getTipoBadge = (tipo) => {
        const styles = {
            ENTRADA: "bg-green-100 text-green-800",
            SAIDA: "bg-red-100 text-red-800",
            AJUSTE: "bg-yellow-100 text-yellow-800"
        };
        return styles[tipo] || "bg-gray-100 text-gray-800";
    };

    const getMotivoLabel = (motivo) => {
        const labels = {
            COMPRA: "Compra",
            DEVOLUCAO: "Devolução",
            VENDA: "Venda",
            PERDA: "Perda",
            AJUSTE: "Ajuste",
            INVENTARIO: "Inventário"
        };
        return labels[motivo] || motivo;
    };

    const handleExportExcel = () => {
        const columns = [
            { header: "Data/Hora", accessor: "createdAt", formatter: formatDateTime },
            { header: "Peça", accessor: (item) => `${item.peca?.codigo} - ${item.peca?.descricao}` },
            { header: "Tipo", accessor: "tipo" },
            { header: "Quantidade", accessor: "quantidade" },
            { header: "Motivo", accessor: "motivo", formatter: getMotivoLabel },
            { header: "Documento", accessor: "documento" },
            { header: "Usuário", accessor: (item) => item.usuario?.nome || "-" },
            { header: "Observações", accessor: "observacoes" }
        ];
        exportToExcel(movimentacoes, "movimentacoes-estoque", columns);
    };

    const handleExportPDF = () => {
        const columns = [
            { header: "Data/Hora", accessor: "createdAt", formatter: formatDateTime },
            { header: "Peça", accessor: (item) => `${item.peca?.codigo} - ${item.peca?.descricao}` },
            { header: "Tipo", accessor: "tipo" },
            { header: "Quantidade", accessor: "quantidade" },
            { header: "Motivo", accessor: "motivo", formatter: getMotivoLabel },
            { header: "Documento", accessor: "documento" },
            { header: "Usuário", accessor: (item) => item.usuario?.nome || "-" }
        ];
        exportToPDF(movimentacoes, "Relatório de Movimentações de Estoque", "movimentacoes-estoque", columns);
    };

    const handleNovaMovimentacao = (peca = null) => {
        setPecaSelecionada(peca);
        setModalAberto(true);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Movimentações de Estoque</h1>
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
                    <button
                        onClick={() => handleNovaMovimentacao()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                    >
                        <FiPlus /> Nova Movimentação
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por peça..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        value={pecaId}
                        onChange={(e) => setPecaId(e.target.value)}
                    >
                        <option value="">Todas as peças</option>
                        {pecas.map(p => (
                            <option key={p.id} value={p.id}>{p.codigo} - {p.descricao}</option>
                        ))}
                    </select>
                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="">Todos os tipos</option>
                        <option value="ENTRADA">Entrada</option>
                        <option value="SAIDA">Saída</option>
                        <option value="AJUSTE">Ajuste</option>
                    </select>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <FiRefreshCw /> Atualizar
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {movimentacoes.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peça</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movimentacoes.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {formatDateTime(mov.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {mov.peca?.codigo}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {mov.peca?.descricao}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoBadge(mov.tipo)}`}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {mov.quantidade}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getMotivoLabel(mov.motivo)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {mov.documento || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {mov.usuario?.nome || '-'}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500">
                                        {mov.observacoes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                    </div>
                )}
            </div>

            {pagination?.pages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.pages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <MovimentacaoModal
                isOpen={modalAberto}
                onClose={() => {
                    setModalAberto(false);
                    setPecaSelecionada(null);
                }}
                onSuccess={() => {
                    refetch();
                }}
                pecaInicial={pecaSelecionada}
                pecasList={pecas}
            />
        </div>
    );
}