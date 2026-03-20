const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function criarAdminCompleto() {
    console.log('🚀 Criando usuário ADMIN completo...');

    // 1. Garantir que o perfil ADMIN existe
    let perfilAdmin = await prisma.perfil.findUnique({
        where: { nome: 'ADMIN' }
    });

    if (!perfilAdmin) {
        console.log('📝 Criando perfil ADMIN...');
        perfilAdmin = await prisma.perfil.create({
            data: {
                nome: 'ADMIN',
                descricao: 'Administrador do sistema',
                permissoes: JSON.stringify({
                    dashboard: ['view', 'export'],
                    clientes: ['create', 'read', 'update', 'delete'],
                    veiculos: ['create', 'read', 'update', 'delete'],
                    agendamentos: ['create', 'read', 'update', 'delete'],
                    os: ['create', 'read', 'update', 'delete', 'approve'],
                    estoque: ['create', 'read', 'update', 'delete'],
                    financeiro: ['create', 'read', 'update', 'delete'],
                    usuarios: ['create', 'read', 'update', 'delete'],
                    relatorios: ['view', 'export'],
                    configuracoes: ['view', 'edit']
                })
            }
        });
        console.log('✅ Perfil ADMIN criado:', perfilAdmin.id);
    } else {
        console.log('✅ Perfil ADMIN encontrado:', perfilAdmin.id);
    }

    // 2. Criar hash da senha
    const senha = 'admin123';
    const hash = await bcrypt.hash(senha, 10);
    console.log('🔐 Hash gerado');

    // 3. Criar ou atualizar usuário
    const email = 'super.admin@oficina.com';

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
        console.log('📝 Atualizando usuário existente...');
        const usuario = await prisma.usuario.update({
            where: { email },
            data: {
                nome: 'Super Administrador',
                senha: hash,
                ativo: true,
                perfilId: perfilAdmin.id
            }
        });
        console.log('✅ Usuário atualizado:', usuario.email);
    } else {
        console.log('📝 Criando novo usuário...');
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'Super Administrador',
                email: email,
                senha: hash,
                telefone: '(11) 99999-9999',
                ativo: true,
                perfilId: perfilAdmin.id
            }
        });
        console.log('✅ Usuário criado:', usuario.email);
    }

    console.log('\n🎯 Dados para login:');
    console.log('   Email: super.admin@oficina.com');
    console.log('   Senha: admin123');
}

criarAdminCompleto()
    .catch(console.error)
    .finally(() => prisma.$disconnect());