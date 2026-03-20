import api from "./index";

// Mock de dados para desenvolvimento (enquanto backend não estiver pronto)
const mockVeiculos = [
    {
        id: 1,
        placa: "ABC-1234",
        marca: "Toyota",
        modelo: "Corolla",
        anoFabricacao: 2020,
        anoModelo: 2020,
        cor: "Prata",
        combustivel: "FLEX",
        cambio: "AUTOMATICO",
        kmAtual: 50000,
        clienteId: 1,
        clienteNome: "João Silva",
        observacoes: "Cliente desde 2020",
        ativo: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-03-10T14:20:00Z"
    },
    {
        id: 2,
        placa: "DEF-5678",
        marca: "Honda",
        modelo: "Civic",
        anoFabricacao: 2021,
        anoModelo: 2021,
        cor: "Preto",
        combustivel: "FLEX",
        cambio: "CVT",
        kmAtual: 30000,
        clienteId: 2,
        clienteNome: "Maria Oliveira",
        observacoes: "",
        ativo: true,
        createdAt: "2024-02-20T09:15:00Z",
        updatedAt: "2024-03-12T11:30:00Z"
    },
    {
        id: 3,
        placa: "GHI-9012",
        marca: "Fiat",
        modelo: "Uno",
        anoFabricacao: 2019,
        anoModelo: 2019,
        cor: "Branco",
        combustivel: "FLEX",
        cambio: "MANUAL",
        kmAtual: 80000,
        clienteId: 3,
        clienteNome: "Empresa XYZ Ltda",
        observacoes: "Veículo da frota",
        ativo: true,
        createdAt: "2024-01-05T14:00:00Z",
        updatedAt: "2024-03-15T09:45:00Z"
    }
];

// Função para simular delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para filtrar veículos
const filtrarVeiculos = (params) => {
    let filtered = [...mockVeiculos];

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(v =>
            v.placa.toLowerCase().includes(searchLower) ||
            v.marca.toLowerCase().includes(searchLower) ||
            v.modelo.toLowerCase().includes(searchLower) ||
            v.clienteNome?.toLowerCase().includes(searchLower)
        );
    }

    if (params.clienteId) {
        filtered = filtered.filter(v => v.clienteId === Number(params.clienteId));
    }

    if (params.marca) {
        filtered = filtered.filter(v => v.marca.toLowerCase() === params.marca.toLowerCase());
    }

    if (params.ativo !== undefined) {
        const ativoBool = params.ativo === 'true';
        filtered = filtered.filter(v => v.ativo === ativoBool);
    }

    return filtered;
};

// Paginação
const paginarResultados = (data, page, limit) => {
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);

    return {
        data: paginatedData,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: data.length,
            pages: Math.ceil(data.length / limit)
        }
    };
};

export const veiculosAPI = {
    // Listar veículos
    listar: async (params = {}) => {
        console.log("🚗 API Veículos - Listar (mock)");

        try {
            // Tenta API real primeiro
            const response = await fetch('http://localhost:3334/health');
            if (response.ok) {
                console.log("✅ Backend disponível, usando API real");
                const { data } = await api.get("/veiculos", { params });
                return data;
            }
        } catch (error) {
            console.log("⚠️ Usando dados mockados");
        }

        await delay(500);

        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;

        const filtered = filtrarVeiculos(params);
        return paginarResultados(filtered, page, limit);
    },

    // Buscar por ID
    buscarPorId: async (id) => {
        console.log("🚗 API Veículos - Buscar ID:", id);

        try {
            const response = await fetch('http://localhost:3334/health');
            if (response.ok) {
                const { data } = await api.get(`/veiculos/${id}`);
                return data;
            }
        } catch (error) {
            console.log("⚠️ Usando dados mockados");
        }

        await delay(300);

        if (id === "novo") {
            return {
                data: {
                    id: null,
                    placa: "",
                    marca: "",
                    modelo: "",
                    anoFabricacao: new Date().getFullYear(),
                    anoModelo: new Date().getFullYear(),
                    cor: "",
                    combustivel: "FLEX",
                    cambio: "MANUAL",
                    kmAtual: 0,
                    clienteId: null,
                    observacoes: "",
                    ativo: true
                }
            };
        }

        const veiculo = mockVeiculos.find(v => v.id === Number(id));
        if (veiculo) {
            return { data: veiculo };
        }

        throw new Error("Veículo não encontrado");
    },

    // Buscar por placa
    buscarPorPlaca: async (placa) => {
        try {
            const { data } = await api.get(`/veiculos/placa/${placa}`);
            return data;
        } catch (error) {
            console.log("Erro ao buscar por placa:", error);
            throw error;
        }
    },

    // Buscar por cliente
    buscarPorCliente: async (clienteId) => {
        try {
            const { data } = await api.get(`/veiculos/cliente/${clienteId}`);
            return data;
        } catch (error) {
            console.log("Erro ao buscar por cliente:", error);
            throw error;
        }
    },

    // Criar veículo
    criar: async (veiculo) => {
        console.log("🚗 API Veículos - Criar:", veiculo);

        try {
            const response = await fetch('http://localhost:3334/health');
            if (response.ok) {
                const { data } = await api.post("/veiculos", veiculo);
                return data;
            }
        } catch (error) {
            console.log("⚠️ Usando dados mockados");
        }

        await delay(500);

        const novoVeiculo = {
            id: mockVeiculos.length + 1,
            ...veiculo,
            clienteNome: "Cliente Teste",
            ativo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockVeiculos.push(novoVeiculo);

        return { data: novoVeiculo };
    },

    // Atualizar veículo
    atualizar: async (id, veiculo) => {
        console.log("🚗 API Veículos - Atualizar:", id, veiculo);
        console.log("📦 Dados completos enviados:", JSON.stringify(veiculo, null, 2)); // ADICIONE ESTA LINHA

        try {
            const response = await fetch('http://localhost:3334/health');
            if (response.ok) {
                console.log("✅ Backend disponível, usando API real");
                const { data } = await api.put(`/veiculos/${id}`, veiculo);
                return data;
            }
        } catch (error) {
            console.log("⚠️ Erro na API real, usando dados mockados");
            console.log("❌ Erro detalhado:", error.response?.data); // E ESTA LINHA
        }

        await delay(500);

        const index = mockVeiculos.findIndex(v => v.id === Number(id));
        if (index !== -1) {
            mockVeiculos[index] = {
                ...mockVeiculos[index],
                ...veiculo,
                id: Number(id),
                clienteNome: mockVeiculos[index].clienteNome,
                updatedAt: new Date().toISOString()
            };
            console.log("✅ Mock atualizado:", mockVeiculos[index]);
            return { data: mockVeiculos[index] };
        }

        throw new Error("Veículo não encontrado");
    },

    // Deletar (soft delete)
    deletar: async (id) => {
        console.log("🚗 API Veículos - Deletar:", id);

        try {
            const response = await fetch('http://localhost:3334/health');
            if (response.ok) {
                await api.delete(`/veiculos/${id}`);
                return;
            }
        } catch (error) {
            console.log("⚠️ Usando dados mockados");
        }

        await delay(500);

        const index = mockVeiculos.findIndex(v => v.id === Number(id));
        if (index !== -1) {
            mockVeiculos[index].ativo = false;
            mockVeiculos[index].updatedAt = new Date().toISOString();
        }

        return { success: true };
    },

    // Ativar/Desativar
    toggleStatus: async (id) => {
        try {
            const { data } = await api.patch(`/veiculos/${id}/toggle-status`);
            return data;
        } catch (error) {
            console.log("Erro ao toggle status:", error);
            throw error;
        }
    },

    // Histórico de serviços do veículo
    historicoServicos: async (id) => {
        try {
            const { data } = await api.get(`/veiculos/${id}/historico`);
            return data;
        } catch (error) {
            console.log("Erro ao buscar histórico:", error);
            throw error;
        }
    }
};