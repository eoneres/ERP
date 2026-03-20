import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordensServicoAPI } from "../../services/api/ordensServico";
import { estoqueAPI } from "../../services/api/estoque";
import toast from "react-hot-toast";

export default function SelecionarPecas({ osId, pecas, onAdd, onRemove, readonly }) {
    const [novaPeca, setNovaPeca] = useState({
        pecaId: "",
        quantidade: 1,
        desconto: 0
    });

    const queryClient = useQueryClient();

    const { data: pecasData } = useQuery({
        queryKey: ["pecas-select"],
        queryFn: () => estoqueAPI.listarPecas({ limit: 100 }),
    });
    const pecasDisponiveis = pecasData?.data || [];

    const addMutation = useMutation({
        mutationFn: (dados) => ordensServicoAPI.adicionarPeca(osId, dados),
        onSuccess: (data) => {
            onAdd(data.data);
            setNovaPeca({ pecaId: "", quantidade: 1, desconto: 0 });
            queryClient.invalidateQueries(["resumo-financeiro", osId]);
            toast.success("Peça adicionada");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao adicionar peça")
    });

    const removeMutation = useMutation({
        mutationFn: (pecaId) => ordensServicoAPI.removerItem(osId, "peca", pecaId),
        onSuccess: () => {
            queryClient.invalidateQueries(["resumo-financeiro", osId]);
            toast.success("Peça removida");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao remover peça")
    });

    const handleAdd = () => {
        if (!novaPeca.pecaId) {
            toast.error("Selecione uma peça");
            return;
        }
        const pecaSelecionada = pecasDisponiveis.find(p => p.id === parseInt(novaPeca.pecaId));
        if (pecaSelecionada && pecaSelecionada.estoqueAtual < novaPeca.quantidade) {
            toast.error(`Estoque insuficiente. Disponível: ${pecaSelecionada.estoqueAtual}`);
            return;
        }
        addMutation.mutate({
            pecaId: parseInt(novaPeca.pecaId),
            quantidade: parseInt(novaPeca.quantidade),
            desconto: parseFloat(novaPeca.desconto) || 0
        });
    };

    const handleRemove = (peca) => {
        if (peca.id) {
            removeMutation.mutate(peca.id);
        } else {
            const index = pecas.findIndex(p => p.tempId === peca.tempId);
            if (index !== -1) onRemove(index);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Peças</h2>

            {!readonly && (
                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded">
                    <select
                        className="col-span-2 p-2 border rounded"
                        value={novaPeca.pecaId}
                        onChange={(e) => setNovaPeca({ ...novaPeca, pecaId: e.target.value })}
                    >
                        <option value="">Selecione uma peça</option>
                        {pecasDisponiveis.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.codigo} - {p.descricao} (Estoque: {p.estoqueAtual})
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Qtd"
                        min="1"
                        className="p-2 border rounded"
                        value={novaPeca.quantidade}
                        onChange={(e) => setNovaPeca({ ...novaPeca, quantidade: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Desconto R$"
                        className="p-2 border rounded"
                        value={novaPeca.desconto}
                        onChange={(e) => setNovaPeca({ ...novaPeca, desconto: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="bg-primary-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-primary-700"
                    >
                        <FiPlus /> Adicionar
                    </button>
                </div>
            )}

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descrição</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantidade</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Valor Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Desconto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        {!readonly && <th className="px-4 py-2"></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pecas.map((p, index) => (
                        <tr key={p.id || index}>
                            <td className="px-4 py-2">{p.peca?.codigo || p.codigo}</td>
                            <td className="px-4 py-2">{p.peca?.descricao || p.descricao}</td>
                            <td className="px-4 py-2">{p.quantidade}</td>
                            <td className="px-4 py-2">R$ {p.valorUnitario?.toFixed(2)}</td>
                            <td className="px-4 py-2">R$ {p.desconto?.toFixed(2)}</td>
                            <td className="px-4 py-2 font-medium">R$ {p.total?.toFixed(2)}</td>
                            {!readonly && (
                                <td className="px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(p)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {pecas.length === 0 && (
                        <tr>
                            <td colSpan={!readonly ? 7 : 6} className="px-4 py-4 text-center text-gray-500">
                                Nenhuma peça adicionada
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}