# Sistema de Gestão Geral (Oficina Mecânica)

![Dashboard](screenshots/dashboard.png)

Sistema web completo para gerenciamento de oficinas mecânicas, desenvolvido com foco em usabilidade, escalabilidade e boas práticas de desenvolvimento.

## 🚀 Funcionalidades

- **Clientes e Veículos**: Cadastro completo com validação de CPF/CNPJ, histórico de serviços.
- **Agendamentos**: Calendário interativo, verificação de disponibilidade, status.
- **Ordens de Serviço (OS)**: Controle de serviços, peças, mão de obra, status (aberta, aprovada, em execução, concluída, entregue, cancelada).
- **Estoque**: Cadastro de peças, fornecedores, movimentações (entrada/saída), alerta de estoque baixo.
- **Financeiro**: Contas a receber (vinculadas a OS), contas a pagar, fluxo de caixa, relatórios.
- **Relatórios**: Exportação para Excel e PDF, gráficos de faturamento, serviços mais executados.
- **Usuários e Perfis**: Controle de acesso com perfis ADMIN, ATENDENTE, MECANICO, com permissões granulares.
- **Configurações da Empresa**: Dados da oficina, logo, parâmetros do sistema (impostos, comissões, tolerância).

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite (desenvolvimento) / PostgreSQL (produção)
- JWT (autenticação)
- Express Validator

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Query (TanStack)
- React Hook Form
- Recharts (gráficos)
- XLSX + jsPDF (exportação)
- Headless UI + Heroicons

## 📋 Pré‑requisitos

- Node.js 18+
- npm ou yarn
- Git

## 🔧 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-gerenciamento.git
cd oficina-mecanica

# Backend
cd backend
npm install
cp .env.example .env   # configure as variáveis
npx prisma migrate dev --name init
npx prisma db seed      # opcional: cria usuário admin
npm run dev

# Frontend (em outro terminal)
cd ../frontend
npm install
npm run dev

Acesse: http://localhost:5173

Credenciais padrão (após seed):

E-mail: admin@oficina.com

Senha: admin123