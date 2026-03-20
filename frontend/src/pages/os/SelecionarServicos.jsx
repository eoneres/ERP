import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordensServicoAPI } from "../../services/api/ordensServico";
import toast from "react-hot-toast";

export default function SelecionarServicos({ osId, servicos, onAdd, onRemove, readonly }) {
    const [novoServico, setNovoServico] = useState({
        descricao: "",
        valorUnitario: "",
        quantidade: 1,
        mecanicoId: "",
        desconto: 0
    });

    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: (dados) => ordensServicoAPI.adicionarServico(osId, dados),
        onSuccess: (data) => {
            onAdd(data.data);
            setNovoServico({ descricao: "", valorUnitario: "", quantidade: 1, mecanicoId: "", desconto: 0 });
            queryClient.invalidateQueries(["resumo-financeiro", osId]);
            toast.success("Serviço adicionado");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao adicionar serviço")
    });

    const removeMutation = useMutation({
        mutationFn: (servicoId) => ordensServicoAPI.removerItem(osId, "servico", servicoId),
        onSuccess: () => {
            queryClient.invalidateQueries(["resumo-financeiro", osId]);
            toast.success("Serviço removido");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao remover serviço")
    });

    const handleAdd = () => {
        if (!novoServico.descricao || !novoServico.valorUnitario) {
            toast.error("Preencha descrição e valor");
            return;
        }

        const dados = {
            descricao: novoServico.descricao,
            valorUnitario: parseFloat(novoServico.valorUnitario),
            quantidade: parseInt(novoServico.quantidade) || 1,
            mecanicoId: novoServico.mecanicoId ? parseInt(novoServico.mecanicoId) : undefined,
        };

        addMutation.mutate(dados);
    };

    const handleRemove = (servico) => {
        if (servico.id) {
            removeMutation.mutate(servico.id);
        } else {
            // Se for serviço recém-adicionado (sem ID), remove da lista local
            const index = servicos.findIndex(s => s.tempId === servico.tempId);
            if (index !== -1) onRemove(index);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Serviços</h2>

            {!readonly && (
                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded">
                    <input
                        type="text"
                        placeholder="Descrição"
                        className="col-span-2 p-2 border rounded"
                        value={novoServico.descricao}
                        onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Valor R$"
                        className="p-2 border rounded"
                        value={novoServico.valorUnitario}
                        onChange={(e) => setNovoServico({ ...novoServico, valorUnitario: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Qtd"
                        min="1"
                        className="p-2 border rounded"
                        value={novoServico.quantidade}
                        onChange={(e) => setNovoServico({ ...novoServico, quantidade: e.target.value })}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descrição</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Valor Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qtd</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Desconto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mecânico</th>
                        {!readonly && <th className="px-4 py-2"></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {servicos.map((s, index) => (
                        <tr key={s.id || index}>
                            <td className="px-4 py-2">{s.descricao}</td>
                            <td className="px-4 py-2">R$ {s.valorUnitario?.toFixed(2)}</td>
                            <td className="px-4 py-2">{s.quantidade}</td>
                            <td className="px-4 py-2">R$ {s.desconto?.toFixed(2)}</td>
                            <td className="px-4 py-2 font-medium">R$ {s.total?.toFixed(2)}</td>
                            <td className="px-4 py-2">{s.mecanico?.nome || '-'}</td>
                            {!readonly && (
                                <td className="px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(s)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {servicos.length === 0 && (
                        <tr>
                            <td colSpan={!readonly ? 7 : 6} className="px-4 py-4 text-center text-gray-500">
                                Nenhum serviço adicionado
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}