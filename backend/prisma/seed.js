const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed...');

    // 1. Criar perfis
    const perfis = await Promise.all([
        prisma.perfil.upsert({
            where: { nome: 'ADMIN' },
            update: {},
            create: { nome: 'ADMIN', descricao: 'Administrador' }
        }),
        prisma.perfil.upsert({
            where: { nome: 'ATENDENTE' },
            update: {},
            create: { nome: 'ATENDENTE', descricao: 'Atendente' }
        }),
        prisma.perfil.upsert({
            where: { nome: 'MECANICO' },
            update: {},
            create: { nome: 'MECANICO', descricao: 'Mecânico' }
        })
    ]);

    console.log('✅ Perfis criados');

    // 2. Criar usuário admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.upsert({
        where: { email: 'admin@oficina.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@oficina.com',
            senha: adminHash,
            telefone: '(11) 99999-9999',
            ativo: true,
            perfilId: perfis[0].id
        }
    });

    console.log('✅ Admin criado');

    // 3. Criar clientes de exemplo
    const clientes = await Promise.all([
        prisma.cliente.create({
            data: {
                nome: 'João Silva',
                documento: '123.456.789-00',
                email: 'joao@email.com',
                telefone1: '(11) 99999-9999',
                tipo: 'FISICA',
                endereco: 'Rua A, 123',
                cidade: 'São Paulo',
                uf: 'SP'
            }
        }),
        prisma.cliente.create({
            data: {
                nome: 'Maria Oliveira',
                documento: '987.654.321-00',
                email: 'maria@email.com',
                telefone1: '(11) 98888-8888',
                tipo: 'FISICA',
                endereco: 'Rua B, 456',
                cidade: 'São Paulo',
                uf: 'SP'
            }
        }),
        prisma.cliente.create({
            data: {
                nome: 'Empresa XYZ',
                documento: '12.345.678/0001-90',
                email: 'contato@xyz.com',
                telefone1: '(11) 3777-7777',
                tipo: 'JURIDICA',
                endereco: 'Av. Comercial, 789',
                cidade: 'São Paulo',
                uf: 'SP'
            }
        })
    ]);

    console.log('✅ Clientes criados');

    // 4. Criar veículos
    const veiculos = await Promise.all([
        prisma.veiculo.create({
            data: {
                placa: 'ABC-1234',
                marca: 'Toyota',
                modelo: 'Corolla',
                anoFabricacao: 2020,
                anoModelo: 2020,
                kmAtual: 50000,
                clienteId: clientes[0].id
            }
        }),
        prisma.veiculo.create({
            data: {
                placa: 'DEF-5678',
                marca: 'Honda',
                modelo: 'Civic',
                anoFabricacao: 2021,
                anoModelo: 2021,
                kmAtual: 30000,
                clienteId: clientes[1].id
            }
        })
    ]);

    console.log('✅ Veículos criados');

    // 5. Criar algumas OS
    const os = await Promise.all([
        prisma.ordemServico.create({
            data: {
                numero: 'OS-2024-0001',
                clienteId: clientes[0].id,
                veiculoId: veiculos[0].id,
                kmEntrada: 50000,
                status: 'CONCLUIDA',
                dataAbertura: new Date('2024-03-01'),
                dataFechamento: new Date('2024-03-02')
            }
        }),
        prisma.ordemServico.create({
            data: {
                numero: 'OS-2024-0002',
                clienteId: clientes[1].id,
                veiculoId: veiculos[1].id,
                kmEntrada: 30000,
                status: 'EM_EXECUCAO',
                dataAbertura: new Date('2024-03-10')
            }
        })
    ]);

    console.log('✅ OS criadas');

    // 6. Criar serviços para as OS
    await Promise.all([
        prisma.servicoOS.create({
            data: {
                ordemServicoId: os[0].id,
                descricao: 'Troca de óleo',
                valorUnitario: 150,
                quantidade: 1,
                total: 150,
                status: 'CONCLUIDO'
            }
        }),
        prisma.servicoOS.create({
            data: {
                ordemServicoId: os[0].id,
                descricao: 'Alinhamento',
                valorUnitario: 120,
                quantidade: 1,
                total: 120,
                status: 'CONCLUIDO'
            }
        }),
        prisma.servicoOS.create({
            data: {
                ordemServicoId: os[1].id,
                descricao: 'Revisão completa',
                valorUnitario: 500,
                quantidade: 1,
                total: 500,
                status: 'PENDENTE'
            }
        })
    ]);

    console.log('✅ Serviços criados');

    // 7. Criar registros financeiros
    await Promise.all([
        prisma.financeiro.create({
            data: {
                ordemServicoId: os[0].id,
                tipo: 'RECEITA',
                formaPagamento: 'PIX',
                valorTotal: 270,
                valorPago: 270,
                status: 'PAGO',
                dataVencimento: new Date('2024-03-02'),
                dataPagamento: new Date('2024-03-02')
            }
        })
    ]);

    console.log('✅ Financeiro criado');

    // 8. Criar agendamentos
    await prisma.agendamento.create({
        data: {
            dataHora: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
            clienteId: clientes[2].id,
            veiculoId: veiculos[1].id,
            servicos: JSON.stringify(['Revisão', 'Troca de óleo']),
            status: 'CONFIRMADO'
        }
    });

    console.log('✅ Agendamento criado');
    console.log('🎉 Seed concluído com sucesso!');
}

main()
    .catch(e => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });