const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class EstoqueService {
    // ==================== PEÇAS ====================
    async listarPecas(filtros = {}) {
        try {
            const { page = 1, limit = 10, search, estoqueBaixo } = filtros;
            const skip = (page - 1) * limit;

            const where = { ativo: true };

            if (search) {
                where.OR = [
                    { codigo: { contains: search, mode: 'insensitive' } },
                    { descricao: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (estoqueBaixo === 'true') {
                where.estoqueAtual = { lte: prisma.peca.fields.estoqueMinimo };
            }

            const pecas = await prisma.peca.findMany({
                where,
                include: {
                    fornecedor: {
                        select: {
                            id: true,
                            razaoSocial: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { codigo: 'asc' }
            });

            const total = await prisma.peca.count({ where });

            const pecasComStatus = (pecas || []).map(peca => ({
                ...peca,
                statusEstoque: this.calcularStatusEstoque(peca)
            }));

            return {
                data: pecasComStatus,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Erro em listarPecas:', error);
            return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
        }
    }

    async buscarPecaPorId(id) {
        try {
            if (!id) throw new Error('ID não fornecido');
            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(id) },
                include: {
                    fornecedor: true,
                    movimentacoes: {
                        take: 20,
                        orderBy: { createdAt: 'desc' },
                        include: { usuario: { select: { nome: true } } }
                    }
                }
            });

            if (!peca) throw new Error('Peça não encontrada');

            return {
                ...peca,
                statusEstoque: this.calcularStatusEstoque(peca)
            };
        } catch (error) {
            console.error('Erro em buscarPecaPorId:', error);
            throw error;
        }
    }

    async criarPeca(data) {
        try {
            const codigoExistente = await prisma.peca.findUnique({
                where: { codigo: data.codigo.toUpperCase() }
            });

            if (codigoExistente) throw new Error('Código já cadastrado');

            const peca = await prisma.peca.create({
                data: {
                    codigo: data.codigo.toUpperCase(),
                    descricao: data.descricao,
                    categoria: data.categoria || null,
                    marca: data.marca || null,
                    localizacao: data.localizacao || null,
                    estoqueMinimo: data.estoqueMinimo || 0,
                    estoqueMaximo: data.estoqueMaximo || 0,
                    estoqueAtual: 0,
                    precoCusto: data.precoCusto,
                    precoVenda: data.precoVenda,
                    fornecedorId: data.fornecedorId ? parseInt(data.fornecedorId) : null,
                    ativo: true
                }
            });

            logger.info(`Peça criada: ${peca.codigo}`);
            return peca;
        } catch (error) {
            console.error('Erro em criarPeca:', error);
            throw error;
        }
    }

    async atualizarPeca(id, data) {
        try {
            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(id) }
            });

            if (!peca) throw new Error('Peça não encontrada');

            if (data.codigo && data.codigo.toUpperCase() !== peca.codigo) {
                const existente = await prisma.peca.findUnique({
                    where: { codigo: data.codigo.toUpperCase() }
                });
                if (existente) throw new Error('Código já cadastrado');
            }

            const pecaAtualizada = await prisma.peca.update({
                where: { id: parseInt(id) },
                data: {
                    codigo: data.codigo?.toUpperCase(),
                    descricao: data.descricao,
                    categoria: data.categoria,
                    marca: data.marca,
                    localizacao: data.localizacao,
                    estoqueMinimo: data.estoqueMinimo,
                    estoqueMaximo: data.estoqueMaximo,
                    precoCusto: data.precoCusto,
                    precoVenda: data.precoVenda,
                    fornecedorId: data.fornecedorId ? parseInt(data.fornecedorId) : undefined,
                    ativo: data.ativo
                }
            });

            logger.info(`Peça atualizada: ${pecaAtualizada.codigo}`);
            return pecaAtualizada;
        } catch (error) {
            console.error('Erro em atualizarPeca:', error);
            throw error;
        }
    }

    async deletarPeca(id) {
        try {
            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(id) }
            });

            if (!peca) throw new Error('Peça não encontrada');

            await prisma.peca.update({
                where: { id: parseInt(id) },
                data: { ativo: false }
            });

            logger.info(`Peça desativada: ${peca.codigo}`);
            return { message: 'Peça desativada com sucesso' };
        } catch (error) {
            console.error('Erro em deletarPeca:', error);
            throw error;
        }
    }

    // ==================== MOVIMENTAÇÕES ====================
    async entradaEstoque(data, usuarioId) {
        try {
            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(data.pecaId) }
            });

            if (!peca) throw new Error('Peça não encontrada');

            await prisma.peca.update({
                where: { id: parseInt(data.pecaId) },
                data: { estoqueAtual: { increment: parseInt(data.quantidade) } }
            });

            const movimentacao = await prisma.movimentacaoEstoque.create({
                data: {
                    pecaId: parseInt(data.pecaId),
                    tipo: 'ENTRADA',
                    quantidade: parseInt(data.quantidade),
                    motivo: data.motivo,
                    documento: data.documento || null,
                    observacoes: data.observacoes || null,
                    usuarioId: parseInt(usuarioId)
                }
            });

            logger.info(`Entrada registrada: ${data.quantidade} unidades`);
            return movimentacao;
        } catch (error) {
            console.error('Erro em entradaEstoque:', error);
            throw error;
        }
    }

    async saidaEstoque(data, usuarioId) {
        try {
            console.log("📥 saidaEstoque - dados recebidos:", data);
            console.log("📥 saidaEstoque - usuarioId:", usuarioId);

            if (!data.pecaId) throw new Error('Peça não informada');
            if (!data.quantidade) throw new Error('Quantidade não informada');

            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(data.pecaId) }
            });

            if (!peca) throw new Error('Peça não encontrada');

            console.log("✅ Peça encontrada:", peca);

            if (peca.estoqueAtual < data.quantidade) {
                throw new Error(`Estoque insuficiente. Disponível: ${peca.estoqueAtual}`);
            }

            await prisma.peca.update({
                where: { id: parseInt(data.pecaId) },
                data: { estoqueAtual: { decrement: parseInt(data.quantidade) } }
            });

            const movimentacao = await prisma.movimentacaoEstoque.create({
                data: {
                    pecaId: parseInt(data.pecaId),
                    tipo: 'SAIDA',
                    quantidade: parseInt(data.quantidade),
                    motivo: data.motivo,
                    documento: data.documento || null,
                    observacoes: data.observacoes || null,
                    usuarioId: parseInt(usuarioId)
                }
            });

            logger.info(`Saída registrada: ${data.quantidade} unidades`);
            return movimentacao;
        } catch (error) {
            console.error('❌ Erro em saidaEstoque:', error);
            throw error;
        }
    }

    async listarMovimentacoes(filtros = {}) {
        const { page = 1, limit = 10, pecaId, search, tipo } = filtros;
        const skip = (page - 1) * limit;

        const where = {};
        if (pecaId) where.pecaId = parseInt(pecaId);
        if (tipo) where.tipo = tipo;
        if (search) {
            where.OR = [
                { peca: { codigo: { contains: search, mode: 'insensitive' } } },
                { peca: { descricao: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const movimentacoes = await prisma.movimentacaoEstoque.findMany({
            where,
            include: {
                peca: { select: { codigo: true, descricao: true } },
                usuario: { select: { nome: true } }
            },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.movimentacaoEstoque.count({ where });

        return {
            data: movimentacoes || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // ==================== FORNECEDORES ====================
    async listarFornecedores(filtros = {}) {
        try {
            const { page = 1, limit = 10, search } = filtros;
            const skip = (page - 1) * limit;

            const where = { ativo: true };

            if (search) {
                where.OR = [
                    { razaoSocial: { contains: search, mode: 'insensitive' } },
                    { nomeFantasia: { contains: search, mode: 'insensitive' } },
                    { cnpj: { contains: search } }
                ];
            }

            const fornecedores = await prisma.fornecedor.findMany({
                where,
                include: {
                    _count: { select: { pecas: true } }
                },
                skip,
                take: parseInt(limit),
                orderBy: { razaoSocial: 'asc' }
            });

            const total = await prisma.fornecedor.count({ where });

            return {
                data: fornecedores || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Erro em listarFornecedores:', error);
            return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
        }
    }

    async buscarFornecedorPorId(id) {
        try {
            if (!id) throw new Error('ID não fornecido');
            const fornecedor = await prisma.fornecedor.findUnique({
                where: { id: parseInt(id) },
                include: {
                    pecas: {
                        where: { ativo: true },
                        select: {
                            id: true,
                            codigo: true,
                            descricao: true,
                            precoCusto: true,
                            precoVenda: true,
                            estoqueAtual: true
                        }
                    }
                }
            });

            if (!fornecedor) throw new Error('Fornecedor não encontrado');

            return fornecedor;
        } catch (error) {
            console.error('Erro em buscarFornecedorPorId:', error);
            throw error;
        }
    }

    async criarFornecedor(data) {
        try {
            const cnpj = data.cnpj.replace(/[^\d]/g, '');

            const existente = await prisma.fornecedor.findUnique({
                where: { cnpj }
            });

            if (existente) throw new Error('CNPJ já cadastrado');

            const fornecedor = await prisma.fornecedor.create({
                data: {
                    razaoSocial: data.razaoSocial,
                    nomeFantasia: data.nomeFantasia || null,
                    cnpj,
                    inscricaoEstadual: data.inscricaoEstadual || null,
                    telefone1: data.telefone1.replace(/[^\d]/g, ''),
                    telefone2: data.telefone2 ? data.telefone2.replace(/[^\d]/g, '') : null,
                    email: data.email || null,
                    contato: data.contato || null,
                    cep: data.cep ? data.cep.replace(/[^\d]/g, '') : null,
                    endereco: data.endereco || null,
                    numero: data.numero || null,
                    complemento: data.complemento || null,
                    bairro: data.bairro || null,
                    cidade: data.cidade || null,
                    uf: data.uf || null,
                    observacoes: data.observacoes || null,
                    ativo: true
                }
            });

            logger.info(`Fornecedor criado: ${fornecedor.razaoSocial}`);
            return fornecedor;
        } catch (error) {
            console.error('Erro em criarFornecedor:', error);
            throw error;
        }
    }

    async atualizarFornecedor(id, data) {
        try {
            console.log("📥 atualizarFornecedor - ID:", id);
            console.log("📥 dados recebidos:", JSON.stringify(data, null, 2));

            if (!id) throw new Error('ID não fornecido');
            const fornecedorId = parseInt(id);

            const fornecedor = await prisma.fornecedor.findUnique({
                where: { id: fornecedorId }
            });

            if (!fornecedor) throw new Error('Fornecedor não encontrado');

            // Construir objeto de atualização
            const updateData = {};

            if (data.razaoSocial !== undefined) updateData.razaoSocial = data.razaoSocial;
            if (data.nomeFantasia !== undefined) updateData.nomeFantasia = data.nomeFantasia;
            if (data.inscricaoEstadual !== undefined) updateData.inscricaoEstadual = data.inscricaoEstadual;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.contato !== undefined) updateData.contato = data.contato;
            if (data.endereco !== undefined) updateData.endereco = data.endereco;
            if (data.numero !== undefined) updateData.numero = data.numero;
            if (data.complemento !== undefined) updateData.complemento = data.complemento;
            if (data.bairro !== undefined) updateData.bairro = data.bairro;
            if (data.cidade !== undefined) updateData.cidade = data.cidade;
            if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
            if (data.ativo !== undefined) updateData.ativo = data.ativo;

            // Campos que precisam de limpeza
            if (data.cnpj) {
                const cnpjLimpo = data.cnpj.replace(/[^\d]/g, '');
                if (cnpjLimpo !== fornecedor.cnpj) {
                    const existente = await prisma.fornecedor.findUnique({
                        where: { cnpj: cnpjLimpo }
                    });
                    if (existente) throw new Error('CNPJ já cadastrado');
                    updateData.cnpj = cnpjLimpo;
                }
            }

            if (data.telefone1) {
                updateData.telefone1 = data.telefone1.replace(/[^\d]/g, '');
            }

            if (data.telefone2) {
                updateData.telefone2 = data.telefone2.replace(/[^\d]/g, '');
            }

            if (data.cep) {
                updateData.cep = data.cep.replace(/[^\d]/g, '');
            }

            if (data.uf) {
                updateData.uf = data.uf.toUpperCase();
            }

            console.log("📦 Dados para update:", updateData);

            const fornecedorAtualizado = await prisma.fornecedor.update({
                where: { id: fornecedorId },
                data: updateData
            });
            console.log('✅ fornecedorAtualizado retornado do banco:', fornecedorAtualizado);

            logger.info(`Fornecedor atualizado: ${fornecedorAtualizado.razaoSocial}`);
            return fornecedorAtualizado;
        } catch (error) {
            console.error('❌ Erro em atualizarFornecedor:', error);
            throw error;
        }
    }

    async deletarFornecedor(id) {
        try {
            const fornecedor = await prisma.fornecedor.findUnique({
                where: { id: parseInt(id) },
                include: { _count: { select: { pecas: true } } }
            });

            if (!fornecedor) throw new Error('Fornecedor não encontrado');

            if (fornecedor._count.pecas > 0) {
                throw new Error('Fornecedor possui peças vinculadas');
            }

            await prisma.fornecedor.update({
                where: { id: parseInt(id) },
                data: { ativo: false }
            });

            logger.info(`Fornecedor desativado: ${fornecedor.razaoSocial}`);
            return { message: 'Fornecedor desativado com sucesso' };
        } catch (error) {
            console.error('Erro em deletarFornecedor:', error);
            throw error;
        }
    }

    // ==================== INVENTÁRIO ====================
    async ajustarEstoque(data, usuarioId) {
        try {
            const peca = await prisma.peca.findUnique({
                where: { id: parseInt(data.pecaId) }
            });

            if (!peca) throw new Error('Peça não encontrada');

            const diferenca = data.quantidadeAtual - peca.estoqueAtual;

            if (diferenca !== 0) {
                await prisma.movimentacaoEstoque.create({
                    data: {
                        pecaId: parseInt(data.pecaId),
                        tipo: 'AJUSTE',
                        quantidade: Math.abs(diferenca),
                        motivo: 'INVENTARIO',
                        documento: `AJUSTE-${Date.now()}`,
                        observacoes: `${data.motivo} - Diferença: ${diferenca > 0 ? '+' : ''}${diferenca}`,
                        usuarioId: parseInt(usuarioId)
                    }
                });

                await prisma.peca.update({
                    where: { id: parseInt(data.pecaId) },
                    data: { estoqueAtual: data.quantidadeAtual }
                });
            }

            return { message: 'Estoque ajustado com sucesso', diferenca };
        } catch (error) {
            console.error('Erro em ajustarEstoque:', error);
            throw error;
        }
    }

    async getDashboardData() {
        try {
            const [totalPecas, totalFornecedores, estoqueBaixo] = await Promise.all([
                prisma.peca.count({ where: { ativo: true } }),
                prisma.fornecedor.count({ where: { ativo: true } }),
                prisma.peca.count({
                    where: {
                        ativo: true,
                        estoqueAtual: { lte: prisma.peca.fields.estoqueMinimo },
                        estoqueMinimo: { gt: 0 }
                    }
                })
            ]);

            return { totalPecas, totalFornecedores, estoqueBaixo };
        } catch (error) {
            console.error('Erro em getDashboardData:', error);
            return { totalPecas: 0, totalFornecedores: 0, estoqueBaixo: 0 };
        }
    }

    async getAlertasEstoque() {
        try {
            const alertas = await prisma.peca.findMany({
                where: {
                    ativo: true,
                    estoqueAtual: { lte: prisma.peca.fields.estoqueMinimo },
                    estoqueMinimo: { gt: 0 }
                },
                select: {
                    id: true,
                    codigo: true,
                    descricao: true,
                    estoqueAtual: true,
                    estoqueMinimo: true
                },
                orderBy: { estoqueAtual: 'asc' }
            });

            return alertas || [];
        } catch (error) {
            console.error('Erro em getAlertasEstoque:', error);
            return [];
        }


    }

    async getRelatorioMovimentacoes(dataInicio, dataFim) {
        try {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);

            const movimentacoes = await prisma.movimentacaoEstoque.findMany({
                where: {
                    createdAt: {
                        gte: inicio,
                        lte: fim
                    }
                },
                include: {
                    peca: { select: { codigo: true, descricao: true } },
                    usuario: { select: { nome: true } }
                },
                orderBy: { createdAt: 'asc' }
            });

            const entradas = movimentacoes.filter(m => m.tipo === 'ENTRADA');
            const saidas = movimentacoes.filter(m => m.tipo === 'SAIDA');
            const ajustes = movimentacoes.filter(m => m.tipo === 'AJUSTE');

            const totalEntradas = entradas.reduce((acc, m) => acc + m.quantidade, 0);
            const totalSaidas = saidas.reduce((acc, m) => acc + m.quantidade, 0);
            const totalAjustes = ajustes.reduce((acc, m) => acc + m.quantidade, 0);

            return {
                periodo: { inicio, fim },
                totalMovimentacoes: movimentacoes.length,
                totalEntradas,
                totalSaidas,
                totalAjustes,
                entradas,
                saidas,
                ajustes
            };
        } catch (error) {
            console.error('Erro em getRelatorioMovimentacoes:', error);
            throw error;
        }
    }

    calcularStatusEstoque(peca) {
        if (!peca) return 'NORMAL';
        if (peca.estoqueAtual === 0) return 'SEM_ESTOQUE';
        if (peca.estoqueMinimo > 0 && peca.estoqueAtual <= peca.estoqueMinimo) return 'BAIXO';
        if (peca.estoqueMaximo > 0 && peca.estoqueAtual >= peca.estoqueMaximo) return 'EXCEDENTE';
        return 'NORMAL';
    }
}

module.exports = new EstoqueService();