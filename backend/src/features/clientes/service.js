const prisma = require('../../config/database');
const formatters = require('../../utils/formatters');

class ClienteService {
    // Validar documento
    validateDocumento(tipo, documento) {
        const numbers = formatters.onlyNumbers(documento);

        if (!numbers) {
            return { valid: false, message: 'Documento é obrigatório' };
        }

        if (tipo === 'FISICA') {
            if (numbers.length !== 11) {
                return { valid: false, message: 'CPF deve ter 11 dígitos' };
            }
        } else if (tipo === 'JURIDICA') {
            if (numbers.length !== 14) {
                return { valid: false, message: 'CNPJ deve ter 14 dígitos' };
            }
        } else {
            return { valid: false, message: 'Tipo inválido' };
        }

        return { valid: true, numbers };
    }

    // Preparar dados para criar/atualizar
    prepareData(data, isUpdate = false) {
        const prepared = {};

        // Campos básicos
        if (data.nome !== undefined) prepared.nome = data.nome?.trim();
        if (data.tipo !== undefined) prepared.tipo = data.tipo;
        if (data.ativo !== undefined) prepared.ativo = data.ativo;

        // Documento (sempre limpar)
        if (data.documento !== undefined) {
            prepared.documento = formatters.onlyNumbers(data.documento);
        }

        // Telefones (sempre limpar)
        if (data.telefone1 !== undefined) {
            prepared.telefone1 = formatters.onlyNumbers(data.telefone1);
        }
        if (data.telefone2 !== undefined) {
            prepared.telefone2 = data.telefone2 ? formatters.onlyNumbers(data.telefone2) : null;
        }

        // CEP (sempre limpar)
        if (data.cep !== undefined) {
            prepared.cep = data.cep ? formatters.onlyNumbers(data.cep) : null;
        }

        // Campos opcionais
        const optionalFields = [
            'rg', 'inscricaoEstadual', 'dataNascimento', 'email',
            'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf',
            'nomeFantasia', 'observacoes'
        ];

        optionalFields.forEach(field => {
            if (data[field] !== undefined) {
                prepared[field] = data[field] || null;
            }
        });

        return prepared;
    }

    // Listar clientes
    async listar(filtros = {}) {
        const { page = 1, limit = 10, search, tipo, ativo } = filtros;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { documento: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (tipo) where.tipo = tipo;
        if (ativo !== undefined) where.ativo = ativo === 'true';

        const [clientes, total] = await prisma.$transaction([
            prisma.cliente.findMany({
                where,
                include: {
                    veiculos: {
                        where: { ativo: true },
                        select: {
                            id: true,
                            placa: true,
                            marca: true,
                            modelo: true
                        }
                    },
                    _count: {
                        select: {
                            ordensServico: true,
                            agendamentos: true
                        }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { nome: 'asc' }
            }),
            prisma.cliente.count({ where })
        ]);

        return {
            data: clientes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar por ID
    async buscarPorId(id) {
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(id) },
            include: {
                veiculos: {
                    where: { ativo: true },
                    orderBy: { createdAt: 'desc' }
                },
                ordensServico: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        veiculo: {
                            select: {
                                placa: true,
                                marca: true,
                                modelo: true
                            }
                        }
                    }
                },
                agendamentos: {
                    where: {
                        status: { notIn: ['CANCELADO', 'CONCLUIDO'] }
                    },
                    orderBy: { dataHora: 'asc' },
                    take: 5
                }
            }
        });

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        return cliente;
    }

    // Criar cliente
    async criar(data) {
        // Validar documento
        const docValidation = this.validateDocumento(data.tipo, data.documento);
        if (!docValidation.valid) {
            throw new Error(docValidation.message);
        }

        // Verificar se documento já existe
        const existente = await prisma.cliente.findUnique({
            where: { documento: docValidation.numbers }
        });

        if (existente) {
            throw new Error('Documento já cadastrado');
        }

        // Preparar dados
        const preparedData = this.prepareData({
            ...data,
            documento: docValidation.numbers
        });

        // Criar cliente
        const cliente = await prisma.cliente.create({
            data: preparedData
        });

        return cliente;
    }

    // Atualizar cliente
    async atualizar(id, data) {
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(id) }
        });

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        // Validar documento se foi alterado
        if (data.documento && data.documento !== cliente.documento) {
            const docValidation = this.validateDocumento(
                data.tipo || cliente.tipo,
                data.documento
            );

            if (!docValidation.valid) {
                throw new Error(docValidation.message);
            }

            // Verificar se novo documento já existe
            const existente = await prisma.cliente.findUnique({
                where: { documento: docValidation.numbers }
            });

            if (existente && existente.id !== Number(id)) {
                throw new Error('Documento já cadastrado por outro cliente');
            }

            data.documento = docValidation.numbers;
        }

        // Preparar dados
        const preparedData = this.prepareData(data, true);

        // Atualizar cliente
        const clienteAtualizado = await prisma.cliente.update({
            where: { id: Number(id) },
            data: preparedData
        });

        return clienteAtualizado;
    }

    // Deletar (soft delete)
    async deletar(id) {
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(id) }
        });

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        // Verificar se tem OS em aberto
        const osAbertas = await prisma.ordemServico.count({
            where: {
                clienteId: Number(id),
                status: { notIn: ['ENTREGUE', 'CANCELADA'] }
            }
        });

        if (osAbertas > 0) {
            throw new Error('Cliente possui ordens de serviço em aberto');
        }

        await prisma.cliente.update({
            where: { id: Number(id) },
            data: { ativo: false }
        });

        return { message: 'Cliente desativado com sucesso' };
    }
}

module.exports = new ClienteService();