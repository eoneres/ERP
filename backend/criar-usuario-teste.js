const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando criação de usuário de teste...');

    // 1. Buscar o perfil ADMIN
    const perfilAdmin = await prisma.perfil.findFirst({
        where: { nome: 'ADMIN' }
    });

    if (!perfilAdmin) {
        console.log('❌ Perfil ADMIN não encontrado! Criando...');

        // Criar perfil ADMIN se não existir
        const novoPerfil = await prisma.perfil.create({
            data: {
                nome: 'ADMIN',
                descricao: 'Administrador do sistema',
                permissoes: '{}'
            }
        });
        console.log('✅ Perfil ADMIN criado com ID:', novoPerfil.id);
        var perfilId = novoPerfil.id;
    } else {
        console.log('✅ Perfil ADMIN encontrado com ID:', perfilAdmin.id);
        var perfilId = perfilAdmin.id;
    }

    // 2. Gerar hash da senha
    const senhaPlana = '123456';
    const hash = await bcrypt.hash(senhaPlana, 10);
    console.log('🔐 Hash gerado:', hash);
    console.log('📝 Senha plana:', senhaPlana);

    // 3. Criar usuário
    const email = 'teste@oficina.com';

    // Verificar se já existe
    const existente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (existente) {
        console.log('⚠️ Usuário já existe. Atualizando...');
        const atualizado = await prisma.usuario.update({
            where: { email },
            data: {
                senha: hash,
                ativo: true,
                nome: 'Usuário Teste'
            }
        });
        console.log('✅ Usuário atualizado:', atualizado.email);
    } else {
        console.log('📝 Criando novo usuário...');
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: 'Usuário Teste',
                email: email,
                senha: hash,
                telefone: '(11) 99999-9999',
                ativo: true,
                perfilId: perfilId
            }
        });
        console.log('✅ Usuário criado:', novoUsuario.email);
    }

    console.log('\n🎯 Dados para login:');
    console.log('   Email: teste@oficina.com');
    console.log('   Senha: 123456');
}

main()
    .catch(error => {
        console.error('❌ Erro detalhado:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });