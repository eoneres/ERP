import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { veiculosAPI } from "../../services/api/veiculos";
import { clientesAPI } from "../../services/api/clientes";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function VeiculoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Detectar modo pela URL completa
    const location = window.location.pathname;
    const isEditing = location.includes('/editar/');
    const isNew = location.includes('/novo');

    // Extrair o ID real do veículo
    let veiculoId = null;
    if (!isNew && id) {
        veiculoId = id;
    }

    console.log("🔍 Debug ULTRA:", {
        location,
        isEditing,
        isNew,
        idParam: id,
        veiculoId
    });

    const [formData, setFormData] = useState({
        placa: "",
        marca: "",
        modelo: "",
        anoFabricacao: new Date().getFullYear(),
        anoModelo: new Date().getFullYear(),
        cor: "",
        combustivel: "FLEX",
        cambio: "MANUAL",
        kmAtual: 0,
        clienteId: "",
        observacoes: "",
        ativo: true
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar clientes para o select
    const { data: clientesData } = useQuery({
        queryKey: ["clientes-select"],
        queryFn: () => clientesAPI.listar({ limit: 100 }),
    });

    // Buscar dados do veículo se for edição ou visualização
    const { data, isLoading } = useQuery({
        queryKey: ["veiculo", veiculoId],
        queryFn: () => veiculosAPI.buscarPorId(veiculoId),
        enabled: !!veiculoId,
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (isNew) {
                return veiculosAPI.criar(data);
            } else {
                return veiculosAPI.atualizar(veiculoId, data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["veiculos"]);
            toast.success(isNew ? "Veículo cadastrado com sucesso!" : "Veículo atualizado com sucesso!");
            navigate("/veiculos");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Erro ao salvar veículo");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => veiculosAPI.deletar(veiculoId),
        onSuccess: () => {
            queryClient.invalidateQueries(["veiculos"]);
            toast.success("Veículo excluído com sucesso!");
            navigate("/veiculos");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Erro ao excluir veículo");
        },
    });

    // Preencher formulário com dados carregados
    useEffect(() => {
        if (data?.data && !isNew) {
            setFormData({
                placa: data.data.placa || "",
                marca: data.data.marca || "",
                modelo: data.data.modelo || "",
                anoFabricacao: data.data.anoFabricacao || new Date().getFullYear(),
                anoModelo: data.data.anoModelo || new Date().getFullYear(),
                cor: data.data.cor || "",
                combustivel: data.data.combustivel || "FLEX",
                cambio: data.data.cambio || "MANUAL",
                kmAtual: data.data.kmAtual || 0,
                clienteId: data.data.clienteId || "",
                observacoes: data.data.observacoes || "",
                ativo: data.data.ativo !== undefined ? data.data.ativo : true
            });
        }
    }, [data, isNew]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validações básicas
        if (!formData.placa) {
            toast.error("Placa é obrigatória");
            return;
        }
        if (!formData.marca) {
            toast.error("Marca é obrigatória");
            return;
        }
        if (!formData.modelo) {
            toast.error("Modelo é obrigatório");
            return;
        }
        if (!formData.clienteId) {
            toast.error("Cliente é obrigatório");
            return;
        }

        // Preparar dados para o backend
        const dadosParaEnviar = {
            placa: formData.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
            marca: formData.marca.trim(),
            modelo: formData.modelo.trim(),
            anoFabricacao: Number(formData.anoFabricacao),
            anoModelo: Number(formData.anoModelo),
            cor: formData.cor?.trim() || null,
            combustivel: formData.combustivel,
            cambio: formData.cambio,
            kmAtual: Number(formData.kmAtual) || 0,
            clienteId: Number(formData.clienteId),
            observacoes: formData.observacoes?.trim() || null,
            ativo: formData.ativo
        };

        console.log("📤 Dados sendo enviados:", dadosParaEnviar);

        // Única chamada para salvar
        saveMutation.mutate(dadosParaEnviar);
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const clientes = clientesData?.data || [];

    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Novo Veículo" :
                        isEditing ? `Editar Veículo - ${formData.placa}` :
                            `Detalhes do Veículo - ${formData.placa}`}
                </h1>
                {!isNew && !isEditing && (
                    <Link
                        to={`/veiculos/editar/${veiculoId}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Editar Veículo
                    </Link>
                )}
                {isEditing && (
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Excluir Veículo
                    </button>
                )}
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Placa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="placa"
                                value={formData.placa || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                placeholder="ABC-1234"
                                maxLength="8"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marca <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="marca"
                                value={formData.marca || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                placeholder="Ex: Toyota"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modelo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="modelo"
                                value={formData.modelo || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                placeholder="Ex: Corolla"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ano Fabricação
                                </label>
                                <input
                                    type="number"
                                    name="anoFabricacao"
                                    value={formData.anoFabricacao || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing && !isNew}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ano Modelo
                                </label>
                                <input
                                    type="number"
                                    name="anoModelo"
                                    value={formData.anoModelo || ""}
                                    onChange={handleChange}
                                    disabled={!isEditing && !isNew}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                    min="1900"
                                    max={new Date().getFullYear() + 2}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cor
                            </label>
                            <input
                                type="text"
                                name="cor"
                                value={formData.cor || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                placeholder="Ex: Prata"
                            />
                        </div>
                    </div>

                    {/* Coluna 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Combustível
                            </label>
                            <select
                                name="combustivel"
                                value={formData.combustivel || "FLEX"}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            >
                                <option value="GASOLINA">Gasolina</option>
                                <option value="ETANOL">Etanol</option>
                                <option value="FLEX">Flex</option>
                                <option value="DIESEL">Diesel</option>
                                <option value="ELETRICO">Elétrico</option>
                                <option value="HIBRIDO">Híbrido</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Câmbio
                            </label>
                            <select
                                name="cambio"
                                value={formData.cambio || "MANUAL"}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            >
                                <option value="MANUAL">Manual</option>
                                <option value="AUTOMATICO">Automático</option>
                                <option value="CVT">CVT</option>
                                <option value="SEQUENCIAL">Sequencial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quilometragem Atual
                            </label>
                            <input
                                type="number"
                                name="kmAtual"
                                value={formData.kmAtual || 0}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                min="0"
                                step="1000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="clienteId"
                                value={formData.clienteId || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações
                            </label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes || ""}
                                onChange={handleChange}
                                disabled={!isEditing && !isNew}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                placeholder="Observações sobre o veículo..."
                            />
                        </div>

                        {(isEditing || isNew) && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="ativo"
                                    checked={formData.ativo}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Veículo ativo
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate("/veiculos")}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Voltar
                    </button>
                    {(isEditing || isNew) && (
                        <button
                            type="submit"
                            disabled={saveMutation.isLoading}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    )}
                </div>
            </form>

            {/* Dialog de exclusão */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Excluir Veículo"
                message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}