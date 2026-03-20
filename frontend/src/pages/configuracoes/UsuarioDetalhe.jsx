import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosAPI } from "../../services/api/usuarios";
import { perfisAPI } from "../../services/api/perfis";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function UsuarioDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const usuarioId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        telefone: "",
        perfilId: "",
        ativo: true
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Buscar perfis
    const { data: perfisData } = useQuery({
        queryKey: ["perfis-select"],
        queryFn: () => perfisAPI.listar(),
    });
    const perfis = perfisData?.data || [];

    // Buscar dados do usuário (se for edição/visualização)
    const { data, isLoading } = useQuery({
        queryKey: ["usuario", usuarioId],
        queryFn: () => usuariosAPI.buscarPorId(usuarioId),
        enabled: !!usuarioId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            setFormData({
                nome: data.data.nome || "",
                email: data.data.email || "",
                senha: "",
                confirmarSenha: "",
                telefone: data.data.telefone || "",
                perfilId: data.data.perfilId?.toString() || "",
                ativo: data.data.ativo !== undefined ? data.data.ativo : true
            });
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            // Se for edição e senha estiver vazia, não enviar senha
            const dadosEnvio = { ...dados };
            if (!isNew && !dadosEnvio.senha) {
                delete dadosEnvio.senha;
                delete dadosEnvio.confirmarSenha;
            }
            if (isNew) {
                return usuariosAPI.criar(dadosEnvio);
            } else {
                return usuariosAPI.atualizar(usuarioId, dadosEnvio);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            toast.success(isNew ? "Usuário criado!" : "Usuário atualizado!");
            navigate("/configuracoes/usuarios");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Erro ao salvar");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => usuariosAPI.toggleStatus(usuarioId),
        onSuccess: () => {
            queryClient.invalidateQueries(["usuarios"]);
            toast.success("Usuário desativado!");
            navigate("/configuracoes/usuarios");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao desativar"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.email || !formData.perfilId) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }
        if (isNew && (!formData.senha || !formData.confirmarSenha)) {
            toast.error("Senha e confirmação são obrigatórias para novo usuário");
            return;
        }
        if (formData.senha !== formData.confirmarSenha) {
            toast.error("As senhas não conferem");
            return;
        }

        const dadosEnvio = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone || null,
            perfilId: parseInt(formData.perfilId),
            ativo: formData.ativo
        };
        if (formData.senha) {
            dadosEnvio.senha = formData.senha;
        }

        saveMutation.mutate(dadosEnvio);
    };

    if (isLoading) return <Loading />;

    const podeEditar = isEditing || isNew;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isNew ? "Novo Usuário" : isEditing ? "Editar Usuário" : "Detalhes do Usuário"}
                </h1>
                {!isNew && !isEditing && (
                    <>
                        <Link
                            to={`/configuracoes/usuarios/editar/${usuarioId}`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Editar
                        </Link>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Desativar
                        </button>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">E-mail *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone</label>
                        <input
                            type="text"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    {(isNew || (isEditing && podeEditar)) && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Senha {isNew && "*"}</label>
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    disabled={!podeEditar}
                                    className="w-full p-2 border rounded disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirmar Senha {isNew && "*"}</label>
                                <input
                                    type="password"
                                    name="confirmarSenha"
                                    value={formData.confirmarSenha}
                                    onChange={handleChange}
                                    disabled={!podeEditar}
                                    className="w-full p-2 border rounded disabled:bg-gray-100"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Perfil *</label>
                        <select
                            name="perfilId"
                            value={formData.perfilId}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        >
                            <option value="">Selecione um perfil</option>
                            {perfis.map(p => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>

                    {(isEditing || isNew) && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                className="h-4 w-4 text-primary-600 rounded"
                                disabled={!podeEditar}
                            />
                            <label className="ml-2 text-sm">Usuário ativo</label>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => navigate("/configuracoes/usuarios")} className="px-4 py-2 border rounded">
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
                title="Desativar Usuário"
                message="Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema."
                confirmText="Desativar"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}