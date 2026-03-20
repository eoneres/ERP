import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresaAPI } from "../../services/api/empresa";
import Loading from "../../components/ui/Loading";
import toast from "react-hot-toast";

export default function EmpresaConfig() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        nome: "",
        nomeFantasia: "",
        cnpj: "",
        inscricaoEstadual: "",
        telefone: "",
        email: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        impostoIss: 0,
        impostoIcms: 0,
        comissaoMecanico: 0,
        toleranciaCancelamentoHoras: 2,
        logoUrl: ""
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["empresa"],
        queryFn: () => empresaAPI.getConfig()
    });

    useEffect(() => {
        if (data?.data) {
            setFormData({
                nome: data.data.nome || "",
                nomeFantasia: data.data.nomeFantasia || "",
                cnpj: data.data.cnpj || "",
                inscricaoEstadual: data.data.inscricaoEstadual || "",
                telefone: data.data.telefone || "",
                email: data.data.email || "",
                endereco: data.data.endereco || "",
                numero: data.data.numero || "",
                complemento: data.data.complemento || "",
                bairro: data.data.bairro || "",
                cidade: data.data.cidade || "",
                uf: data.data.uf || "",
                cep: data.data.cep || "",
                impostoIss: data.data.impostoIss || 0,
                impostoIcms: data.data.impostoIcms || 0,
                comissaoMecanico: data.data.comissaoMecanico || 0,
                toleranciaCancelamentoHoras: data.data.toleranciaCancelamentoHoras || 2,
                logoUrl: data.data.logoUrl || ""
            });
            if (data.data.logoUrl) setLogoPreview(data.data.logoUrl);
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: (dados) => empresaAPI.updateConfig(dados),
        onSuccess: () => {
            queryClient.invalidateQueries(["empresa"]);
            toast.success("Configurações salvas!");
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao salvar")
    });

    const uploadLogoMutation = useMutation({
        mutationFn: (file) => {
            const form = new FormData();
            form.append("logo", file);
            return empresaAPI.uploadLogo(form);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["empresa"]);
            toast.success("Logo atualizado!");
            setLogoPreview(data.data.logoUrl);
        },
        onError: (error) => toast.error(error.response?.data?.error || "Erro ao fazer upload")
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value
        }));
    };

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadLogo = () => {
        if (logoFile) {
            uploadLogoMutation.mutate(logoFile);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dados = {};
        for (const [key, value] of Object.entries(formData)) {
            if (value !== undefined && value !== null && value !== '') {
                dados[key] = value;
            } else if (['impostoIss', 'impostoIcms', 'comissaoMecanico', 'toleranciaCancelamentoHoras'].includes(key)) {
                if (value === '') dados[key] = 0;
                else if (value === 0) dados[key] = 0;
            }
        }

        updateMutation.mutate(dados);
    };


    if (isLoading) return <Loading />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Configurações da Empresa</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Logo da Empresa</label>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="border rounded px-3 py-2"
                            />
                            <button
                                type="button"
                                onClick={handleUploadLogo}
                                disabled={uploadLogoMutation.isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploadLogoMutation.isLoading ? "Enviando..." : "Enviar Logo"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Razão Social</label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
                        <input
                            type="text"
                            name="nomeFantasia"
                            value={formData.nomeFantasia}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Inscrição Estadual</label>
                        <input
                            type="text"
                            name="inscricaoEstadual"
                            value={formData.inscricaoEstadual}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone</label>
                        <input
                            type="text"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            value={formData.endereco}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Número</label>
                        <input
                            type="text"
                            name="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={formData.complemento}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cidade</label>
                        <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
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
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">CEP</label>
                        <input
                            type="text"
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="col-span-2 border-t pt-6">
                        <h2 className="text-lg font-semibold mb-4">Parâmetros do Sistema</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">ISS (%)</label>
                                <input
                                    type="number"
                                    name="impostoIss"
                                    value={formData.impostoIss}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ICMS (%)</label>
                                <input
                                    type="number"
                                    name="impostoIcms"
                                    value={formData.impostoIcms}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Comissão Mecânico (%)</label>
                                <input
                                    type="number"
                                    name="comissaoMecanico"
                                    value={formData.comissaoMecanico}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tolerância Cancelamento (horas)</label>
                                <input
                                    type="number"
                                    name="toleranciaCancelamentoHoras"
                                    value={formData.toleranciaCancelamentoHoras}
                                    onChange={handleChange}
                                    step="1"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button type="submit" disabled={updateMutation.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                        {updateMutation.isLoading ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </form>
        </div>
    );
}