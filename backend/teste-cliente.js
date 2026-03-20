const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testar() {
    try {
        // Criar um cliente de teste
        const cliente = await prisma.cliente.create({
            data: {
                nome: "Cliente Teste",
                tipo: "FISICA",
                documento: "12345678909",
                telefone1: "11999999999",
                email: "teste@email.com",
                ativo: true
            }
        });

        console.log("✅ Cliente criado com sucesso:", cliente);

        // Listar todos os clientes
        const clientes = await prisma.cliente.findMany();
        console.log("📋 Total de clientes:", clientes.length);

    } catch (error) {
        console.error("❌ Erro:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testar();