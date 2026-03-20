import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function EstoqueDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;

    // Se for página de fornecedores, redireciona (isso será tratado em outra rota)
    if (path.includes('/fornecedores')) {
        navigate('/estoque/fornecedores');
        return null;
    }

    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const pecaId = isNew ? null : id?.replace('editar/', '');

    console.log("🔍 EstoqueDetalhe - ID:", id, "pecaId:", pecaId, "isNew:", isNew, "isEditing:", isEditing);

    // Estado inicial com campos obrigatórios como string vazia para evitar validação falsa
    const [formData, setFormData] = useState({
        codigo: "",
        descricao: "",
        categoria: "",
        marca: "",
        localizacao: "",
        estoqueMinimo: 0,
        estoqueMaximo: 0,
        estoqueAtual: 0,
        precoCusto: "",      // string vazia para detectar não preenchido
        precoVenda: "",      // string vazia
        fornecedorId: "",
        ativo: true
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar fornecedores para o select
    const { data: fornecedoresData } = useQuery({
        queryKey: ["fornecedores-select"],
        queryFn: () => estoqueAPI.listarFornecedores({ limit: 100 }),
    });

    // Buscar dados da peça (se não for novo)
    const { data, isLoading } = useQuery({
        queryKey: ["peca", pecaId],
        queryFn: () => {
            if (!pecaId || pecaId === "undefined" || pecaId === "fornecedores" || isNaN(pecaId)) {
                console.log("⚠️ ID inválido, não buscando peça");
                return null;
            }
            return estoqueAPI.buscarPecaPorId(pecaId);
        },
        enabled: !!pecaId && pecaId !== "undefined" && pecaId !== "fornecedores" && !isNaN(pecaId),
    });

    const fornecedores = fornecedoresData?.data || [];

    // Preencher formulário quando dados chegarem
    useEffect(() => {
        if (data?.data && !isNew) {
            setFormData({
                codigo: data.data.codigo || "",
                descricao: data.data.descricao || "",
                categoria: data.data.categoria || "",
                marca: data.data.marca || "",
                localizacao: data.data.localizacao || "",
                estoqueMinimo: data.data.estoqueMinimo || 0,
                estoqueMaximo: data.data.estoqueMaximo || 0,
                estoqueAtual: data.data.estoqueAtual || 0,
                precoCusto: data.data.precoCusto ?? "", // se for null, string vazia
                precoVenda: data.data.precoVenda ?? "",
                fornecedorId: data.data.fornecedorId?.toString() || "",
                ativo: data.data.ativo !== undefined ? data.data.ativo : true
            });
        }
    }, [data, isNew]);

    // Mutations
    const saveMutation = useMutation({
        mutationFn: (dados) => {
            // Converter preços para número (se vierem como string)
            const dadosEnviar = {
                ...dados,
                precoCusto: parseFloat(dados.precoCusto) || 0,
                precoVenda: parseFloat(dados.precoVenda) || 0,
                estoqueMinimo: parseInt(dados.estoqueMinimo) || 0,
                estoqueMaximo: parseInt(dados.estoqueMaximo) || 0,
                fornecedorId: dados.fornecedorId ? parseInt(dados.fornecedorId) : null
            };
            if (isNew) {
                return estoqueAPI.criarPeca(dadosEnviar);
            } else {
                return estoqueAPI.atualizarPeca(pecaId, dadosEnviar);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["estoque"]);
            toast.success(isNew ? "Peça cadastrada!" : "Peça atualizada!");
            navigate("/estoque");
        },
        onError: (error) => {
            console.error("Erro ao salvar:", error);
            toast.error(error.response?.data?.error || "Erro ao salvar");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => estoqueAPI.deletarPeca(pecaId),
        onSuccess: () => {
            queryClient.invalidateQueries(["estoque"]);
            toast.success("Peça excluída!");
            navigate("/estoque");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked :
                (type === "number" ? (value === "" ? "" : parseFloat(value)) : value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("📤 Dados do formulário antes da validação:", formData);
        console.log("precoCusto:", formData.precoCusto, "tipo:", typeof formData.precoCusto);
        console.log("precoVenda:", formData.precoVenda, "tipo:", typeof formData.precoVenda);

        // Validações
        if (!formData.codigo || !formData.descricao) {
            toast.error("Código e descrição são obrigatórios");
            return;
        }

        // Verificar preços (devem ser números > 0)
        const precoCustoNum = parseFloat(formData.precoCusto);
        const precoVendaNum = parseFloat(formData.precoVenda);

        if (isNaN(precoCustoNum) || precoCustoNum <= 0) {
            toast.error("Preço de custo deve ser um número positivo");
            return;
        }
        if (isNaN(precoVendaNum) || precoVendaNum <= 0) {
            toast.error("Preço de venda deve ser um número positivo");
            return;
        }
        if (precoVendaNum <= precoCustoNum) {
            toast.error("Preço de venda deve ser maior que o preço de custo");
            return;
        }

        saveMutation.mutate(formData);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Nova Peça" : isEditing ? "Editar Peça" : "Detalhes da Peça"}
                </h1>
                {!isNew && !isEditing && (
                    <Link
                        to={`/estoque/editar/${pecaId}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Editar
                    </Link>
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
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <input
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100 uppercase"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição *</label>
                        <input
                            type="text"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <input
                            type="text"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Marca</label>
                        <input
                            type="text"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Localização</label>
                        <input
                            type="text"
                            name="localizacao"
                            value={formData.localizacao}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100 uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fornecedor</label>
                        <select
                            name="fornecedorId"
                            value={formData.fornecedorId}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Nenhum</option>
                            {fornecedores.map(f => (
                                <option key={f.id} value={f.id}>{f.razaoSocial}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                        <input
                            type="number"
                            name="estoqueMinimo"
                            value={formData.estoqueMinimo}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Estoque Máximo</label>
                        <input
                            type="number"
                            name="estoqueMaximo"
                            value={formData.estoqueMaximo}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Preço Custo (R$) *</label>
                        <input
                            type="number"
                            name="precoCusto"
                            value={formData.precoCusto}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Preço Venda (R$) *</label>
                        <input
                            type="number"
                            name="precoVenda"
                            value={formData.precoVenda}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {!isNew && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Estoque Atual</label>
                            <input
                                type="number"
                                value={formData.estoqueAtual}
                                disabled
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                    )}

                    {(isEditing || isNew) && (
                        <div className="col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 rounded"
                            />
                            <label className="ml-2 text-sm">Peça ativa</label>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => navigate("/estoque")} className="px-4 py-2 border rounded">
                        Voltar
                    </button>
                    {(isEditing || isNew) && (
                        <button type="submit" disabled={saveMutation.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    )}
                </div>
            </form>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Excluir Peça"
                message="Tem certeza que deseja excluir esta peça?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}