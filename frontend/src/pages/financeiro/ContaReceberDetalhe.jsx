import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeiroAPI } from "../../services/api/financeiro";
import { ordensServicoAPI } from "../../services/api/ordensServico";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function ContaReceberDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/nova');
    const isEditing = path.includes('/editar/');
    const contaId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        ordemServicoId: "",
        valorTotal: "",
        formaPagamento: "DINHEIRO",
        parcelas: 1,
        dataVencimento: "",
        observacoes: ""
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar OSs para selecionar (apenas as que não têm conta vinculada)
    const { data: ordensData } = useQuery({
        queryKey: ["ordens-sem-conta"],
        queryFn: () => ordensServicoAPI.listar({ limit: 100, status: "CONCLUIDA" }), // ou critério apropriado
    });
    const ordens = ordensData?.data || [];

    // Buscar dados da conta (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["conta-receber", contaId],
        queryFn: () => financeiroAPI.buscarContaReceber(contaId),
        enabled: !!contaId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            const conta = data.data;
            setFormData({
                ordemServicoId: conta.ordemServicoId?.toString() || "",
                valorTotal: conta.valorTotal,
                formaPagamento: conta.formaPagamento,
                parcelas: conta.parcelas,
                dataVencimento: conta.dataVencimento?.split('T')[0] || "",
                observacoes: conta.observacoes || ""
            });
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            if (isNew) {
                return financeiroAPI.criarContaReceber(dados);
            } else {

                throw new Error("Edição não implementada");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["contas-receber"]);
            toast.success("Conta a receber criada!");
            navigate("/financeiro/contas-receber");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Erro ao salvar");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => financeiroAPI.cancelarConta(contaId, "Exclusão manual"),
        onSuccess: () => {
            queryClient.invalidateQueries(["contas-receber"]);
            toast.success("Conta cancelada!");
            navigate("/financeiro/contas-receber");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao cancelar"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.ordemServicoId || !formData.valorTotal || !formData.dataVencimento) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        const dadosEnvio = {
            ...formData,
            ordemServicoId: parseInt(formData.ordemServicoId),
            valorTotal: parseFloat(formData.valorTotal),
            parcelas: parseInt(formData.parcelas) || 1,
        };

        saveMutation.mutate(dadosEnvio);
    };

    if (isLoading) return <Loading />;

    const podeEditar = isNew; // Só permite criar, não editar

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Nova Conta a Receber" : isEditing ? "Editar Conta" : "Detalhes da Conta"}
                </h1>
                {!isNew && !isEditing && (
                    <>
                        <Link
                            to={`/financeiro/contas-receber/editar/${contaId}`}
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Ordem de Serviço *</label>
                        <select
                            name="ordemServicoId"
                            value={formData.ordemServicoId}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione uma OS</option>
                            {ordens.map(os => (
                                <option key={os.id} value={os.id}>
                                    {os.numero} - {os.cliente?.nome} (R$ {os.total?.toFixed(2)})
                                </option>
                            ))}
                        </select>
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
                    <button type="button" onClick={() => navigate("/financeiro/contas-receber")} className="px-4 py-2 border rounded">
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