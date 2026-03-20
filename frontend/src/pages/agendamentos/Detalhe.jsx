import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agendamentosAPI } from "../../services/api/agendamentos";
import { clientesAPI } from "../../services/api/clientes";
import { veiculosAPI } from "../../services/api/veiculos";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function AgendamentoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const agendamentoId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        dataHora: "",
        clienteId: "",
        veiculoId: "",
        servicos: "[]",
        observacoes: "",
        mecanicoId: "",
        status: "PENDENTE"
    });

    const [servicosList, setServicosList] = useState([]);
    const [novoServico, setNovoServico] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);

    // Buscar clientes para o select
    const { data: clientesData } = useQuery({
        queryKey: ["clientes-select"],
        queryFn: () => clientesAPI.listar({ limit: 100 }),
    });

    // Buscar veículos (quando um cliente é selecionado)
    const { data: veiculosData } = useQuery({
        queryKey: ["veiculos-por-cliente", formData.clienteId],
        queryFn: () => veiculosAPI.buscarPorCliente(formData.clienteId),
        enabled: !!formData.clienteId,
    });

    // Buscar dados do agendamento (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["agendamento", agendamentoId],
        queryFn: () => agendamentosAPI.buscarPorId(agendamentoId),
        enabled: !!agendamentoId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            console.log("📦 Dados recebidos do agendamento:", data.data);

            let dataHora = data.data.dataHora || "";
            if (dataHora) {

                const dataObj = new Date(dataHora);

                // Ajustar para o fuso local
                const tzOffset = dataObj.getTimezoneOffset() * 60000; // offset em ms
                const dataLocal = new Date(dataObj.getTime() - tzOffset);

                dataHora = dataLocal.toISOString().slice(0, 16);
            }

            // Parse seguro dos serviços
            let servicosParsed = [];
            try {
                if (typeof data.data.servicos === 'string') {
                    servicosParsed = JSON.parse(data.data.servicos);
                } else if (Array.isArray(data.data.servicos)) {
                    servicosParsed = data.data.servicos;
                }
            } catch (e) {
                console.error("❌ Erro ao parsear serviços:", e);
                servicosParsed = [];
            }

            setFormData({
                dataHora: dataHora,
                clienteId: data.data.clienteId?.toString() || "",
                veiculoId: data.data.veiculoId?.toString() || "",
                servicos: data.data.servicos || "[]",
                observacoes: data.data.observacoes || "",
                mecanicoId: data.data.mecanicoId?.toString() || "",
                status: data.data.status || "PENDENTE"
            });
            setServicosList(servicosParsed);
        }
    }, [data, isNew]);

    // Verificar disponibilidade quando data/hora ou mecânico mudam
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.dataHora || isEditing) return;

            setCheckingAvailability(true);
            try {
                const result = await agendamentosAPI.verificarDisponibilidade(
                    formData.dataHora,
                    formData.mecanoId || null
                );
                setIsAvailable(result.data.disponivel);
                if (!result.data.disponivel) {
                    toast.error(result.data.motivo);
                }
            } catch (error) {
                console.error("Erro ao verificar disponibilidade:", error);
            } finally {
                setCheckingAvailability(false);
            }
        };

        const timer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timer);
    }, [formData.dataHora, formData.mecanoId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Se mudar o cliente, resetar veículo
        if (name === "clienteId") {
            setFormData(prev => ({ ...prev, veiculoId: "" }));
        }
    };

    const handleAddServico = () => {
        if (!novoServico.trim()) return;
        const newList = [...servicosList, novoServico.trim()];
        setServicosList(newList);
        setFormData(prev => ({ ...prev, servicos: JSON.stringify(newList) }));
        setNovoServico("");
    };

    const handleRemoveServico = (index) => {
        const newList = servicosList.filter((_, i) => i !== index);
        setServicosList(newList);
        setFormData(prev => ({ ...prev, servicos: JSON.stringify(newList) }));
    };

    const saveMutation = useMutation({
        mutationFn: (dados) => isNew ? agendamentosAPI.criar(dados) : agendamentosAPI.atualizar(agendamentoId, dados),
        onSuccess: () => {
            queryClient.invalidateQueries(["agendamentos"]);
            toast.success(isNew ? "Agendamento criado!" : "Agendamento atualizado!");
            navigate("/agendamentos");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao salvar"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => agendamentosAPI.deletar(agendamentoId),
        onSuccess: () => {
            queryClient.invalidateQueries(["agendamentos"]);
            toast.success("Agendamento excluído!");
            navigate("/agendamentos");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const confirmMutation = useMutation({
        mutationFn: () => agendamentosAPI.confirmar(agendamentoId),
        onSuccess: () => {
            queryClient.invalidateQueries(["agendamento", agendamentoId]);
            queryClient.invalidateQueries(["agendamentos"]);
            toast.success("Agendamento confirmado!");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao confirmar"),
    });

    const cancelMutation = useMutation({
        mutationFn: (motivo) => agendamentosAPI.cancelar(agendamentoId, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries(["agendamento", agendamentoId]);
            queryClient.invalidateQueries(["agendamentos"]);
            toast.success("Agendamento cancelado!");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao cancelar"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        let dataHoraEnvio = formData.dataHora;
        if (dataHoraEnvio && !dataHoraEnvio.includes('T')) {
            dataHoraEnvio = new Date(dataHoraEnvio).toISOString();
        }

        const dadosParaEnviar = {
            ...formData,
            dataHora: dataHoraEnvio,
            servicos: JSON.stringify(servicosList)
        };

        console.log("📦 Dados para enviar:", dadosParaEnviar);

        console.log("📦 Dados para enviar:", dadosParaEnviar);

        if (!dadosParaEnviar.dataHora || !dadosParaEnviar.clienteId || !dadosParaEnviar.veiculoId || servicosList.length === 0) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        if (!isEditing && isAvailable === false) {
            toast.error("Este horário não está disponível");
            return;
        }

        saveMutation.mutate(dadosParaEnviar);
    };

    const clientes = clientesData?.data || [];
    const veiculos = veiculosData?.data || [];

    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Novo Agendamento" : isEditing ? `Editar Agendamento` : `Detalhes do Agendamento`}
                </h1>
                {!isNew && !isEditing && (
                    <div className="flex space-x-3">
                        <Link
                            to={`/agendamentos/editar/${agendamentoId}`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Editar
                        </Link>
                        {formData.status === 'PENDENTE' && (
                            <button
                                onClick={() => confirmMutation.mutate()}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Confirmar
                            </button>
                        )}
                        {(formData.status === 'PENDENTE' || formData.status === 'CONFIRMADO') && (
                            <button
                                onClick={() => {
                                    const motivo = prompt("Motivo do cancelamento:");
                                    if (motivo !== null) cancelMutation.mutate(motivo);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                )}
                {isEditing && (
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Excluir
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Data e Hora *
                        </label>
                        <input
                            type="datetime-local"
                            name="dataHora"
                            value={formData.dataHora}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className={`w-full p-2 border rounded ${!isEditing && !isNew ? 'bg-gray-100' :
                                checkingAvailability ? 'bg-yellow-50' :
                                    isAvailable === false ? 'bg-red-50 border-red-300' :
                                        isAvailable === true ? 'bg-green-50 border-green-300' : ''
                                }`}
                        />
                        {!isEditing && !isNew && formData.dataHora && (
                            <p className="text-sm mt-1 text-gray-500">
                                {isAvailable === true && '✓ Horário disponível'}
                                {isAvailable === false && '✗ Horário indisponível'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        {isEditing || isNew ? (
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="PENDENTE">Pendente</option>
                                <option value="CONFIRMADO">Confirmado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData.status}
                                disabled
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Cliente *
                        </label>
                        <select
                            name="clienteId"
                            value={formData.clienteId}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione um cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nome} - {cliente.documento}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Veículo *
                        </label>
                        <select
                            name="veiculoId"
                            value={formData.veiculoId}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew || !formData.clienteId}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione um veículo</option>
                            {veiculos.map(veiculo => (
                                <option key={veiculo.id} value={veiculo.id}>
                                    {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Serviços *
                        </label>
                        {(isEditing || isNew) ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={novoServico}
                                        onChange={(e) => setNovoServico(e.target.value)}
                                        className="flex-1 p-2 border rounded"
                                        placeholder="Digite um serviço"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddServico}
                                        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {servicosList.map((servico, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {servico}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveServico(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {servicosList.map((servico, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                                    >
                                        {servico}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Observações
                        </label>
                        <textarea
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            rows="3"
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            placeholder="Observações sobre o agendamento..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate("/agendamentos")}
                        className="px-4 py-2 border rounded"
                    >
                        Voltar
                    </button>
                    {(isEditing || isNew) && (
                        <button
                            type="submit"
                            disabled={saveMutation.isLoading}
                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                        >
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    )}
                </div>
            </form>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Excluir Agendamento"
                message="Tem certeza que deseja excluir este agendamento?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}