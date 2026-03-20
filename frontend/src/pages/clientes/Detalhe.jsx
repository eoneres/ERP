import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesAPI } from "../../services/api/clientes";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function ClienteDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const clienteId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        nome: "",
        tipo: "FISICA",
        documento: "",
        rg: "",
        inscricaoEstadual: "",
        dataNascimento: "",
        telefone1: "",
        telefone2: "",
        email: "",
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

    const { data, isLoading } = useQuery({
        queryKey: ["cliente", clienteId],
        queryFn: () => clientesAPI.buscarPorId(clienteId),
        enabled: !!clienteId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            setFormData(data.data);
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => isNew ? clientesAPI.criar(dados) : clientesAPI.atualizar(clienteId, dados),
        onSuccess: () => {
            queryClient.invalidateQueries(["clientes"]);
            toast.success(isNew ? "Cliente cadastrado!" : "Cliente atualizado!");
            navigate("/clientes");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao salvar"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => clientesAPI.deletar(clienteId),
        onSuccess: () => {
            queryClient.invalidateQueries(["clientes"]);
            toast.success("Cliente excluído!");
            navigate("/clientes");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.documento || !formData.telefone1) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        saveMutation.mutate(formData);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isNew ? "Novo Cliente" : isEditing ? `Editar ${formData.nome}` : `Detalhes de ${formData.nome}`}
                </h1>
                {!isNew && !isEditing && (
                    <Link to={`/clientes/editar/${clienteId}`} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                        Editar
                    </Link>
                )}
                {isEditing && (
                    <button onClick={() => setShowDeleteDialog(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        Excluir
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} disabled={!isEditing && !isNew} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} disabled={!isEditing && !isNew} className="w-full p-2 border rounded">
                            <option value="FISICA">Pessoa Física</option>
                            <option value="JURIDICA">Pessoa Jurídica</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Documento *</label>
                        <input type="text" name="documento" value={formData.documento} onChange={handleChange} disabled={!isEditing && !isNew} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone *</label>
                        <input type="text" name="telefone1" value={formData.telefone1} onChange={handleChange} disabled={!isEditing && !isNew} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label> {/* ← NOVO CAMPO */}
                        <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing && !isNew} className="w-full p-2 border rounded" placeholder="email@exemplo.com" />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => navigate("/clientes")} className="px-4 py-2 border rounded">
                        Voltar
                    </button>
                    {(isEditing || isNew) && (
                        <button type="submit" disabled={saveMutation.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                            {saveMutation.isLoading ? "Salvando..." : "Salvar"}
                        </button>
                    )}
                </div>
            </form>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Excluir Cliente"
                message="Tem certeza?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}