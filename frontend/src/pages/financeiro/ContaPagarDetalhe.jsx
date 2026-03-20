import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeiroAPI } from "../../services/api/financeiro";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function ContaPagarDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/nova');
    const isEditing = path.includes('/editar/');
    const contaId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        descricao: "",
        valorTotal: "",
        formaPagamento: "DINHEIRO",
        parcelas: 1,
        dataVencimento: "",
        categoria: "OUTROS",
        fornecedorId: "",
        observacoes: ""
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar fornecedores para o select
    const { data: fornecedoresData } = useQuery({
        queryKey: ["fornecedores-select"],
        queryFn: () => estoqueAPI.listarFornecedores({ limit: 100 }),
    });
    const fornecedores = fornecedoresData?.data || [];

    // Buscar dados da conta (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["conta-pagar", contaId],
        queryFn: () => financeiroAPI.buscarContaPagar(contaId),
        enabled: !!contaId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            const conta = data.data;
            setFormData({
                descricao: conta.descricao || "",
                valorTotal: conta.valorTotal,
                formaPagamento: conta.formaPagamento,
                parcelas: conta.parcelas,
                dataVencimento: conta.dataVencimento?.split('T')[0] || "",
                categoria: conta.categoria || "OUTROS",
                fornecedorId: conta.fornecedorId?.toString() || "",
                observacoes: conta.observacoes || ""
            });
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            if (isNew) {
                return financeiroAPI.criarContaPagar(dados);
            } else {
                // Atualização não implementada no backend? Se necessário, adicionar depois.
                throw new Error("Edição não implementada");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["contas-pagar"]);
            toast.success("Conta a pagar criada!");
            navigate("/financeiro/contas-pagar");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Erro ao salvar");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => financeiroAPI.cancelarConta(contaId, "Exclusão manual"),
        onSuccess: () => {
            queryClient.invalidateQueries(["contas-pagar"]);
            toast.success("Conta cancelada!");
            navigate("/financeiro/contas-pagar");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao cancelar"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.descricao || !formData.valorTotal || !formData.dataVencimento) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        const dadosEnvio = {
            ...formData,
            valorTotal: parseFloat(formData.valorTotal),
            parcelas: parseInt(formData.parcelas) || 1,
            fornecedorId: formData.fornecedorId ? parseInt(formData.fornecedorId) : undefined,
        };

        saveMutation.mutate(dadosEnvio);
    };

    if (isLoading) return <Loading />;

    const podeEditar = isNew; // Só permite criar, não editar

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Nova Conta a Pagar" : isEditing ? "Editar Conta" : "Detalhes da Conta"}
                </h1>
                {!isNew && !isEditing && (
                    <>
                        <Link
                            to={`/financeiro/contas-pagar/editar/${contaId}`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Editar
                        </Link>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Cancelar Conta
                        </button>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição *</label>
                        <input
                            type="text"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Valor Total *</label>
                        <input
                            type="number"
                            name="valorTotal"
                            value={formData.valorTotal}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Forma de Pagamento *</label>
                        <select
                            name="formaPagamento"
                            value={formData.formaPagamento}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="CARTAO_DEBITO">Cartão de Débito</option>
                            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                            <option value="PIX">PIX</option>
                            <option value="BOLETO">Boleto</option>
                            <option value="TRANSFERENCIA">Transferência</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Parcelas</label>
                        <input
                            type="number"
                            name="parcelas"
                            value={formData.parcelas}
                            onChange={handleChange}
                            min="1"
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Data de Vencimento *</label>
                        <input
                            type="date"
                            name="dataVencimento"
                            value={formData.dataVencimento}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="COMPRA">Compra</option>
                            <option value="SALARIO">Salário</option>
                            <option value="ALUGUEL">Aluguel</option>
                            <option value="AGUA">Água</option>
                            <option value="LUZ">Luz</option>
                            <option value="TELEFONE">Telefone</option>
                            <option value="INTERNET">Internet</option>
                            <option value="IMPOSTO">Imposto</option>
                            <option value="OUTROS">Outros</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fornecedor</label>
                        <select
                            name="fornecedorId"
                            value={formData.fornecedorId}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Nenhum</option>
                            {fornecedores.map(f => (
                                <option key={f.id} value={f.id}>{f.razaoSocial}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            rows="3"
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={() => navigate("/financeiro/contas-pagar")} className="px-4 py-2 border rounded">
                        Voltar
                    </button>
                    {podeEditar && (
                        <button type="submit" disabled={saveMutation.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    )}
                </div>
            </form>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Cancelar Conta"
                message="Tem certeza que deseja cancelar esta conta?"
                confirmText="Cancelar"
                cancelText="Voltar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}