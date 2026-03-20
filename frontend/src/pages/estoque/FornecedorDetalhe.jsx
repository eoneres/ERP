import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { estoqueAPI } from "../../services/api/estoque";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function FornecedorDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const fornecedorId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        razaoSocial: "",
        nomeFantasia: "",
        cnpj: "",
        inscricaoEstadual: "",
        telefone1: "",
        telefone2: "",
        email: "",
        contato: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        observacoes: "",
        ativo: true
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar dados do fornecedor (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["fornecedor", fornecedorId],
        queryFn: () => estoqueAPI.buscarFornecedorPorId(fornecedorId),
        enabled: !!fornecedorId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            setFormData(data.data);
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            // Limpar campos antes de enviar
            const dadosLimpos = {
                ...dados,
                cnpj: dados.cnpj.replace(/[^\d]/g, ''),
                telefone1: dados.telefone1.replace(/[^\d]/g, ''),
                telefone2: dados.telefone2?.replace(/[^\d]/g, '') || null,
                cep: dados.cep?.replace(/[^\d]/g, '') || null
            };

            if (isNew) {
                return estoqueAPI.criarFornecedor(dadosLimpos);
            } else {
                return estoqueAPI.atualizarFornecedor(fornecedorId, dadosLimpos);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["fornecedores"]);
            toast.success(isNew ? "Fornecedor cadastrado!" : "Fornecedor atualizado!");
            navigate("/estoque/fornecedores");
        },
        onError: (error) => {
            console.error("Erro ao salvar:", error);
            toast.error(error.response?.data?.error || "Erro ao salvar");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => estoqueAPI.deletarFornecedor(fornecedorId),
        onSuccess: () => {
            queryClient.invalidateQueries(["fornecedores"]);
            toast.success("Fornecedor excluído!");
            navigate("/estoque/fornecedores");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.razaoSocial || !formData.cnpj || !formData.telefone1) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        // Validar CNPJ (14 dígitos após limpeza)
        const cnpjLimpo = formData.cnpj.replace(/[^\d]/g, '');
        if (cnpjLimpo.length !== 14) {
            toast.error("CNPJ deve ter 14 dígitos");
            return;
        }

        saveMutation.mutate(formData);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isNew ? "Novo Fornecedor" : isEditing ? "Editar Fornecedor" : "Detalhes do Fornecedor"}
                </h1>
                {!isNew && !isEditing && (
                    <Link
                        to={`/estoque/fornecedores/editar/${fornecedorId}`}
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
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Razão Social *</label>
                        <input
                            type="text"
                            name="razaoSocial"
                            value={formData.razaoSocial}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
                        <input
                            type="text"
                            name="nomeFantasia"
                            value={formData.nomeFantasia}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">CNPJ *</label>
                        <input
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            placeholder="00.000.000/0000-00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Inscrição Estadual</label>
                        <input
                            type="text"
                            name="inscricaoEstadual"
                            value={formData.inscricaoEstadual}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone 1 *</label>
                        <input
                            type="text"
                            name="telefone1"
                            value={formData.telefone1}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone 2</label>
                        <input
                            type="text"
                            name="telefone2"
                            value={formData.telefone2}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Contato</label>
                        <input
                            type="text"
                            name="contato"
                            value={formData.contato}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">CEP</label>
                        <input
                            type="text"
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                            placeholder="00000-000"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            value={formData.endereco}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Número</label>
                        <input
                            type="text"
                            name="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={formData.complemento}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cidade</label>
                        <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">UF</label>
                        <input
                            type="text"
                            name="uf"
                            value={formData.uf}
                            onChange={handleChange}
                            maxLength="2"
                            disabled={!isEditing && !isNew}
                            className="w-full p-2 border rounded disabled:bg-gray-100 uppercase"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            disabled={!isEditing && !isNew}
                            rows="3"
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    {(isEditing || isNew) && (
                        <div className="col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                className="h-4 w-4 text-primary-600 rounded"
                            />
                            <label className="ml-2 text-sm">Fornecedor ativo</label>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => navigate("/estoque/fornecedores")} className="px-4 py-2 border rounded">
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
                title="Excluir Fornecedor"
                message="Tem certeza que deseja excluir este fornecedor?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}