import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordensServicoAPI } from "../../services/api/ordensServico";
import { clientesAPI } from "../../services/api/clientes";
import { veiculosAPI } from "../../services/api/veiculos";
import { agendamentosAPI } from "../../services/api/agendamentos";
import Loading from "../../components/ui/Loading";
import StatusBadge from "../../components/ui/StatusBadge";
import SelecionarServicos from "./SelecionarServicos";
import SelecionarPecas from "./SelecionarPecas";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function OrdemServicoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/nova');
    const isEditing = path.includes('/editar/');
    const osId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        clienteId: "",
        veiculoId: "",
        kmEntrada: "",
        kmSaida: "",
        tipo: "SERVICO",
        observacoes: "",
        agendamentoId: null,
        status: "ABERTA"
    });

    const [servicos, setServicos] = useState([]);
    const [pecas, setPecas] = useState([]);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showConcludeDialog, setShowConcludeDialog] = useState(false);
    const [resumoFinanceiro, setResumoFinanceiro] = useState(null);

    // Buscar clientes
    const { data: clientesData } = useQuery({
        queryKey: ["clientes-select"],
        queryFn: () => clientesAPI.listar({ limit: 100 }),
    });

    // Buscar veículos do cliente selecionado
    const { data: veiculosData } = useQuery({
        queryKey: ["veiculos-por-cliente", formData.clienteId],
        queryFn: () => veiculosAPI.buscarPorCliente(formData.clienteId),
        enabled: !!formData.clienteId,
    });

    // Buscar dados da OS (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["ordem-servico", osId],
        queryFn: () => ordensServicoAPI.buscarPorId(osId),
        enabled: !!osId,
    });

    // Buscar resumo financeiro
    const { data: financeiroData } = useQuery({
        queryKey: ["resumo-financeiro", osId],
        queryFn: () => ordensServicoAPI.resumoFinanceiro(osId),
        enabled: !!osId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            const os = data.data;
            setFormData({
                clienteId: os.clienteId?.toString() || "",
                veiculoId: os.veiculoId?.toString() || "",
                kmEntrada: os.kmEntrada || "",
                kmSaida: os.kmSaida || "",
                tipo: os.tipo || "SERVICO",
                observacoes: os.observacoes || "",
                agendamentoId: os.agendamentoId?.toString() || null,
                status: os.status
            });
            setServicos(os.servicos || []);
            setPecas(os.pecas || []);
        }
    }, [data, isNew]);

    useEffect(() => {
        if (financeiroData?.data) {
            setResumoFinanceiro(financeiroData.data);
        }
    }, [financeiroData]);

    const clientes = clientesData?.data || [];
    const veiculos = veiculosData?.data || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "clienteId") {
            setFormData(prev => ({ ...prev, veiculoId: "" }));
        }
    };

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            console.log("🚀 mutationFn executada com dados:", dados);
            return isNew ? ordensServicoAPI.criar(dados) : ordensServicoAPI.atualizar(osId, dados);
        },
        onSuccess: (data) => {
            console.log("✅ onSuccess disparado! Resposta:", data);
            queryClient.invalidateQueries(["ordens-servico"]);
            toast.success(isNew ? "OS criada!" : "OS atualizada!");
            navigate("/os");
        },
        onError: (error) => {
            console.error("❌ Erro na mutation:", error);
            console.error("📦 Resposta detalhada:", JSON.stringify(error.response?.data, null, 2));
            toast.error(error.response?.data?.error || "Erro ao salvar OS");
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ status, motivo }) => ordensServicoAPI.alterarStatus(osId, status, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries(["ordem-servico", osId]);
            queryClient.invalidateQueries(["resumo-financeiro", osId]);
            toast.success("Status alterado!");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao alterar status"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("📌 handleSubmit executado");

        if (!formData.clienteId || !formData.veiculoId || !formData.kmEntrada) {
            toast.error("Preencha todos os campos obrigatórios");
            console.log("❌ Campos obrigatórios faltando");
            return;
        }

        const dadosParaEnviar = {
            clienteId: parseInt(formData.clienteId),
            veiculoId: parseInt(formData.veiculoId),
            kmEntrada: parseInt(formData.kmEntrada),
            tipo: formData.tipo,
            observacoes: formData.observacoes || null,
        };

        // Só inclui agendamentoId se tiver valor
        if (formData.agendamentoId) {
            dadosParaEnviar.agendamentoId = parseInt(formData.agendamentoId);
        }

        // Só inclui kmSaida se tiver valor
        if (formData.kmSaida) {
            dadosParaEnviar.kmSaida = parseInt(formData.kmSaida);
        }

        console.log("📤 Dados a serem enviados:", dadosParaEnviar);
        saveMutation.mutate(dadosParaEnviar);
        console.log("🚀 saveMutation.mutate chamado");
    };

    const handleAddServico = (novoServico) => {
        setServicos([...servicos, novoServico]);
    };

    const handleRemoveServico = (index) => {
        const novo = [...servicos];
        novo.splice(index, 1);
        setServicos(novo);
    };

    const handleAddPeca = (novaPeca) => {
        setPecas([...pecas, novaPeca]);
    };

    const handleRemovePeca = (index) => {
        const novo = [...pecas];
        novo.splice(index, 1);
        setPecas(novo);
    };

    if (isLoading) return <Loading />;

    const podeEditar = isEditing || isNew;
    const podeAlterarStatus = !isNew && !isEditing && formData.status !== 'CANCELADA' && formData.status !== 'ENTREGUE';

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Nova Ordem de Serviço" : isEditing ? "Editar OS" : `OS ${data?.data?.numero}`}
                </h1>
                <div className="flex space-x-3">
                    {!isNew && !isEditing && (
                        <>
                            <Link to={`/os/editar/${osId}`} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                                Editar
                            </Link>
                            {podeAlterarStatus && formData.status === 'ABERTA' && (
                                <button
                                    onClick={() => statusMutation.mutate({ status: 'AGUARDANDO_APROVACAO' })}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                                >
                                    Solicitar Aprovação
                                </button>
                            )}
                            {podeAlterarStatus && formData.status === 'AGUARDANDO_APROVACAO' && (
                                <button
                                    onClick={() => statusMutation.mutate({ status: 'APROVADA' })}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Aprovar
                                </button>
                            )}
                            {podeAlterarStatus && formData.status === 'APROVADA' && (
                                <button
                                    onClick={() => statusMutation.mutate({ status: 'EM_EXECUCAO' })}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Iniciar Execução
                                </button>
                            )}
                            {podeAlterarStatus && formData.status === 'EM_EXECUCAO' && (
                                <button
                                    onClick={() => setShowConcludeDialog(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Concluir
                                </button>
                            )}
                            {podeAlterarStatus && formData.status === 'CONCLUIDA' && (
                                <button
                                    onClick={() => statusMutation.mutate({ status: 'ENTREGUE' })}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    Registrar Entrega
                                </button>
                            )}
                            {podeAlterarStatus && formData.status !== 'CANCELADA' && (
                                <button
                                    onClick={() => setShowCancelDialog(true)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    Cancelar
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Status atual */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Status atual:</span>
                    <StatusBadge status={formData.status} />
                </div>
            </div>

            {/* Resumo Financeiro (se disponível) */}
            {resumoFinanceiro && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <h2 className="text-lg font-semibold mb-3">Resumo Financeiro</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Serviços</span>
                            <p className="text-xl font-semibold">R$ {resumoFinanceiro.totalServicos.toFixed(2)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Peças</span>
                            <p className="text-xl font-semibold">R$ {resumoFinanceiro.totalPecas.toFixed(2)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Total</span>
                            <p className="text-xl font-semibold">R$ {resumoFinanceiro.totalGeral.toFixed(2)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Pago</span>
                            <p className="text-xl font-semibold text-green-600">R$ {resumoFinanceiro.pago.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente *</label>
                        <select
                            name="clienteId"
                            value={formData.clienteId}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Veículo *</label>
                        <select
                            name="veiculoId"
                            value={formData.veiculoId}
                            onChange={handleChange}
                            disabled={!podeEditar || !formData.clienteId}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">KM Entrada *</label>
                        <input
                            type="number"
                            name="kmEntrada"
                            value={formData.kmEntrada}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">KM Saída</label>
                        <input
                            type="number"
                            name="kmSaida"
                            value={formData.kmSaida}
                            onChange={handleChange}
                            disabled={!podeEditar || formData.status !== 'EM_EXECUCAO'}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="SERVICO">Serviço</option>
                            <option value="ORCAMENTO">Orçamento</option>
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

                {podeEditar && (
                    <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => navigate("/os")} className="px-4 py-2 border rounded">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saveMutation.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                )}
            </form>

            {/* Seção de Serviços */}
            {osId && (
                <>
                    <SelecionarServicos
                        osId={osId}
                        servicos={servicos}
                        onAdd={handleAddServico}
                        onRemove={handleRemoveServico}
                        readonly={!podeEditar}
                    />

                    <SelecionarPecas
                        osId={osId}
                        pecas={pecas}
                        onAdd={handleAddPeca}
                        onRemove={handleRemovePeca}
                        readonly={!podeEditar}
                    />
                </>
            )}

            {/* Dialog de cancelamento */}
            <ConfirmDialog
                isOpen={showCancelDialog}
                title="Cancelar Ordem de Serviço"
                message="Tem certeza que deseja cancelar esta OS? Isso devolverá as peças ao estoque."
                confirmText="Cancelar OS"
                cancelText="Voltar"
                onConfirm={() => {
                    const motivo = prompt("Motivo do cancelamento (opcional):");
                    statusMutation.mutate({ status: 'CANCELADA', motivo: motivo || '' });
                    setShowCancelDialog(false);
                }}
                onCancel={() => setShowCancelDialog(false)}
                type="danger"
            />

            {/* Dialog de conclusão */}
            <ConfirmDialog
                isOpen={showConcludeDialog}
                title="Concluir Ordem de Serviço"
                message="Confirme a quilometragem de saída antes de concluir."
                confirmText="Concluir"
                cancelText="Voltar"
                onConfirm={() => {
                    if (!formData.kmSaida) {
                        toast.error("Quilometragem de saída é obrigatória");
                        return;
                    }
                    statusMutation.mutate({ status: 'CONCLUIDA' });
                    setShowConcludeDialog(false);
                }}
                onCancel={() => setShowConcludeDialog(false)}
                type="info"
            />
        </div>
    );
}