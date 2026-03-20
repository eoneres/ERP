import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { estoqueAPI } from "../../services/api/estoque";
import toast from "react-hot-toast";

export default function MovimentacaoModal({ isOpen, onClose, onSuccess, pecaInicial, pecasList }) {
    const [formData, setFormData] = useState({
        pecaId: pecaInicial?.id || "",
        tipo: "ENTRADA",
        quantidade: "",
        motivo: "COMPRA",
        documento: "",
        observacoes: ""
    });

    useEffect(() => {
        if (pecaInicial) {
            setFormData(prev => ({ ...prev, pecaId: pecaInicial.id }));
        }
    }, [pecaInicial]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "tipo") {
            setFormData(prev => ({
                ...prev,
                tipo: value,
                motivo: value === "ENTRADA" ? "COMPRA" : "VENDA"
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleClose = () => {
        console.log("Fechando modal manualmente");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pecaId) {
            toast.error("Selecione uma peça");
            return;
        }
        if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
            toast.error("Quantidade deve ser maior que zero");
            return;
        }

        const dados = {
            pecaId: formData.pecaId,
            quantidade: parseInt(formData.quantidade),
            motivo: formData.motivo,
            documento: formData.documento || null,
            observacoes: formData.observacoes || null
        };

        console.log("📤 Dados enviados:", dados);

        try {
            if (formData.tipo === "ENTRADA") {
                await estoqueAPI.entradaEstoque(dados);
                toast.success("Entrada registrada com sucesso!");
            } else {
                await estoqueAPI.saidaEstoque(dados);
                toast.success("Saída registrada com sucesso!");
            }
            onSuccess();
            // Reset após fechar
            setFormData({
                pecaId: "",
                tipo: "ENTRADA",
                quantidade: "",
                motivo: "COMPRA",
                documento: "",
                observacoes: ""
            });
        } catch (error) {
            console.error("Erro no modal:", error);
            toast.error(error.response?.data?.error || "Erro ao registrar movimentação");
        }
    };

    const motivosEntrada = [
        { value: "COMPRA", label: "Compra" },
        { value: "DEVOLUCAO", label: "Devolução" },
        { value: "AJUSTE", label: "Ajuste" }
    ];

    const motivosSaida = [
        { value: "VENDA", label: "Venda" },
        { value: "PERDA", label: "Perda" },
        { value: "AJUSTE", label: "Ajuste" }
    ];

    const motivos = formData.tipo === "ENTRADA" ? motivosEntrada : motivosSaida;

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={handleClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
                    <div className="flex justify-between items-center p-6 border-b">
                        <Dialog.Title className="text-lg font-medium">Nova Movimentação</Dialog.Title>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <FiX size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Peça *</label>
                            <select
                                name="pecaId"
                                value={formData.pecaId}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="">Selecione uma peça</option>
                                {pecasList.map(peca => (
                                    <option key={peca.id} value={peca.id}>
                                        {peca.codigo} - {peca.descricao} (Estoque: {peca.estoqueAtual})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500">
                                    <option value="ENTRADA">Entrada</option>
                                    <option value="SAIDA">Saída</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} min="1" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                            <select name="motivo" value={formData.motivo} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500">
                                {motivos.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                            <input type="text" name="documento" value={formData.documento} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" placeholder="Opcional" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows="3" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" placeholder="Opcional" />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Registrar</button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}