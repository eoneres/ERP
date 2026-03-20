import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { perfisAPI } from "../../services/api/perfis";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

const permissoesDisponiveis = {
    dashboard: ["view", "export"],
    clientes: ["create", "read", "update", "delete"],
    veiculos: ["create", "read", "update", "delete"],
    agendamentos: ["create", "read", "update", "delete"],
    os: ["create", "read", "update", "delete", "approve"],
    estoque: ["create", "read", "update", "delete"],
    financeiro: ["create", "read", "update", "delete"],
    usuarios: ["create", "read", "update", "delete"],
    relatorios: ["view", "export"],
    configuracoes: ["view", "edit"]
};

export default function PerfilDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const path = window.location.pathname;
    const isNew = path.includes('/novo');
    const isEditing = path.includes('/editar/');
    const perfilId = isNew ? null : id?.replace('editar/', '');

    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        permissoes: {}
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["perfil", perfilId],
        queryFn: () => perfisAPI.buscarPorId(perfilId),
        enabled: !!perfilId,
    });

    useEffect(() => {
        if (data?.data && !isNew) {
            let permissoes = {};
            try {
                permissoes = JSON.parse(data.data.permissoes || "{}");
            } catch (e) {
                console.warn("Erro ao fazer parse das permissões:", e);
                permissoes = {};
            }
            setFormData({
                nome: data.data.nome || "",
                descricao: data.data.descricao || "",
                permissoes
            });
        }
    }, [data, isNew]);

    const saveMutation = useMutation({
        mutationFn: (dados) => {
            if (isNew) {
                return perfisAPI.criar(dados);
            } else {
                return perfisAPI.atualizar(perfilId, dados);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["perfis"]);
            toast.success(isNew ? "Perfil criado!" : "Perfil atualizado!");
            navigate("/configuracoes/perfis");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao salvar"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => perfisAPI.deletar(perfilId),
        onSuccess: () => {
            queryClient.invalidateQueries(["perfis"]);
            toast.success("Perfil excluído!");
            navigate("/configuracoes/perfis");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao excluir"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (modulo, acao, isChecked) => {
        setFormData(prev => {
            const novasPermissoes = { ...prev.permissoes };
            if (!novasPermissoes[modulo]) novasPermissoes[modulo] = [];
            if (isChecked) {
                if (!novasPermissoes[modulo].includes(acao)) {
                    novasPermissoes[modulo].push(acao);
                }
            } else {
                novasPermissoes[modulo] = novasPermissoes[modulo].filter(a => a !== acao);
                if (novasPermissoes[modulo].length === 0) delete novasPermissoes[modulo];
            }
            return { ...prev, permissoes: novasPermissoes };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nome) {
            toast.error("Nome do perfil é obrigatório");
            return;
        }

        const dadosEnvio = {
            nome: formData.nome,
            descricao: formData.descricao,
            permissoes: JSON.stringify(formData.permissoes)
        };

        saveMutation.mutate(dadosEnvio);
    };

    if (isLoading) return <Loading />;

    const podeEditar = isEditing || isNew;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isNew ? "Novo Perfil" : isEditing ? "Editar Perfil" : "Detalhes do Perfil"}
                </h1>
                {!isNew && !isEditing && (
                    <>
                        <Link
                            to={`/configuracoes/perfis/editar/${perfilId}`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Editar
                        </Link>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Excluir
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
                            className="w-full p-2 border rounded disabled:bg-gray-100 uppercase"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            disabled={!podeEditar}
                            rows="3"
                            className="w-full p-2 border rounded disabled:bg-gray-100"
                        />
                    </div>

                    {podeEditar && (
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4">Permissões</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                                            {Object.values(permissoesDisponiveis)[0].map(acao => (
                                                <th key={acao} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{acao}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(permissoesDisponiveis).map(([modulo, acoes]) => (
                                            <tr key={modulo}>
                                                <td className="px-4 py-2 font-medium capitalize">{modulo}</td>
                                                {acoes.map(acao => (
                                                    <td key={`${modulo}-${acao}`} className="px-4 py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissoes[modulo]?.includes(acao) || false}
                                                            onChange={(e) => handlePermissionChange(modulo, acao, e.target.checked)}
                                                            className="h-4 w-4 text-primary-600 rounded"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => navigate("/configuracoes/perfis")} className="px-4 py-2 border rounded">
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
                title="Excluir Perfil"
                message="Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => deleteMutation.mutate()}
                onCancel={() => setShowDeleteDialog(false)}
                type="danger"
            />
        </div>
    );
}