const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Buscar perfil ADMIN
    const perfilAdmin = await prisma.perfil.findFirst({
        where: { nome: 'ADMIN' }
    });

    if (!perfilAdmin) {
        console.log('❌ Perfil ADMIN não encontrado!');
        return;
    }

    // Gerar hash da senha
    const hash = await bcrypt.hash('admin123', 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
        data: {
            nome: 'Administrador',
            email: 'admin@oficina.com',
            senha: hash,
            telefone: '(11) 99999-9999',
            ativo: true,
            perfilId: perfilAdmin.id
        }
    });

    console.log('✅ Usuário admin criado:');
    console.log('   Email:', usuario.email);
    console.log('   Senha: admin123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());