# 🚗 Sistema de Gestão para Oficina Mecânica

![Versão](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-18-blue)
![Prisma](https://img.shields.io/badge/prisma-5.22.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Sobre o Projeto

Sistema web completo para gestão de oficinas mecânicas, desenvolvido com foco em usabilidade, eficiência operacional e controle financeiro. A plataforma centraliza todas as atividades do negócio em um único ambiente, eliminando planilhas e cadernos, e proporcionando uma visão clara e em tempo real do desempenho da oficina.

### 🎯 Problema Resolvido

Oficinas mecânicas enfrentam desafios diários de organização: controle de clientes, histórico de serviços, gestão de estoque de peças, controle financeiro, agendamentos e ordens de serviço. Este sistema unifica todas essas áreas, reduzindo erros manuais, otimizando o tempo da equipe e melhorando a experiência do cliente.

### ✨ Funcionalidades

| Módulo | Funcionalidades |
|--------|-----------------|
| **Clientes** | Cadastro completo (CPF/CNPJ), histórico de serviços, veículos vinculados, busca avançada |
| **Veículos** | Placa, marca, modelo, ano, quilometragem, histórico de manutenções |
| **Agendamentos** | Calendário interativo, verificação de disponibilidade, status, confirmação/cancelamento |
| **Ordens de Serviço** | Serviços, peças, mão de obra, status (aberta, aprovada, execução, concluída), aprovação de orçamento |
| **Estoque** | Cadastro de peças, fornecedores, movimentações (entrada/saída), alerta de estoque baixo |
| **Financeiro** | Contas a receber (vinculadas a OS), contas a pagar, fluxo de caixa, relatórios |
| **Relatórios** | Exportação para Excel e PDF, gráficos de faturamento, serviços mais executados, movimentações |
| **Usuários e Perfis** | Controle de acesso com perfis (ADMIN, ATENDENTE, MECANICO), permissões granulares |
| **Dashboard** | Indicadores em tempo real, gráficos de receita mensal, OS por status, top serviços |
| **Configurações** | Dados da empresa, logo, parâmetros (impostos, comissões, tolerância de cancelamento) |

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web
- **Prisma ORM** - Mapeamento objeto-relacional
- **PostgreSQL** (produção) / **SQLite** (desenvolvimento) - Banco de dados
- **JWT** - Autenticação e autorização
- **Express Validator** - Validação de dados
- **Winston** - Logs estruturados
- **Multer** - Upload de arquivos

### Frontend
- **React 18** - Biblioteca para interfaces
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **React Query (TanStack)** - Gerenciamento de estado e cache
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Gráficos interativos
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones

### Bibliotecas de Exportação
- **XLSX** - Exportação para Excel
- **jsPDF + jspdf-autotable** - Exportação para PDF

---

## 📊 Estrutura do Projeto

```
oficina-mecanica/
├── backend/
│   ├── src/
│   │   ├── config/           # Configurações (env, database)
│   │   ├── features/         # Módulos do sistema
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── clientes/     # Gestão de clientes
│   │   │   ├── veiculos/     # Gestão de veículos
│   │   │   ├── agendamentos/ # Agendamentos
│   │   │   ├── ordens-servico/# Ordens de serviço
│   │   │   ├── estoque/      # Estoque e movimentações
│   │   │   ├── financeiro/   # Contas e fluxo de caixa
│   │   │   ├── relatorios/   # Relatórios
│   │   │   ├── usuarios/     # Usuários
│   │   │   ├── perfis/       # Perfis de acesso
│   │   │   └── empresa/      # Configurações da empresa
│   │   ├── middlewares/      # Autenticação, upload, erro
│   │   └── utils/            # Helpers, logger
│   ├── prisma/               # Schema e migrações
│   └── uploads/              # Arquivos enviados
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── ui/           # Botões, inputs, modais
│   │   │   └── charts/       # Gráficos (Recharts)
│   │   ├── pages/            # Páginas do sistema
│   │   │   ├── auth/         # Login
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── clientes/     # Listagem e formulário
│   │   │   ├── os/           # Ordens de serviço
│   │   │   ├── estoque/      # Estoque e movimentações
│   │   │   ├── financeiro/   # Contas e relatórios
│   │   │   └── configuracoes/# Usuários, perfis, empresa
│   │   ├── services/         # API services
│   │   ├── hooks/            # Hooks customizados
│   │   ├── contexts/         # Contextos (auth, theme)
│   │   └── utils/            # Formatters, exportUtils
│   └── public/
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### 1. Clone o repositório

### 2. Configure o Backend
```bash
cd backend
npm install
cp .env.example .env   # Configure as variáveis
npx prisma migrate dev --name init
npm run dev
```

### 3. Configure o Frontend
```bash
cd ../frontend
npm install
cp .env.example .env   # Configure a URL da API
npm run dev
```

### 4. Acesse a aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:3334/api

### Credenciais padrão (após seed)
- **E-mail**: `admin@oficina.com`
- **Senha**: `admin123`

---

## 🌍 Deploy em Produção

### Backend (Render)
1. Crie um Web Service no Render conectado ao repositório
2. Configure variáveis de ambiente:
   - `DATABASE_URL`: URL do PostgreSQL (Render oferece banco gratuito)
   - `JWT_SECRET`: chave secreta (gere com `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: URL do frontend (ex: `https://oficina-mecanica.vercel.app`)
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm start`

### Frontend (Vercel)
1. Importe o repositório na Vercel
2. Configure a variável de ambiente:
   - `VITE_API_URL`: URL do backend (ex: `https://oficina-mecanica-api.onrender.com/api`)
3. O build será executado automaticamente

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo (LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Seu Nome**
- LinkedIn: linkedin.com/in/filipe-neres-fernandes-9878b018b
- GitHub: github.com/eoneres

---

## 🙏 Agradecimentos

Agradecimento especial aos profissionais que compartilharam suas rotinas e desafios, ajudando a construir um sistema que realmente atende às necessidades do dia a dia.

---

## 📬 Contato

Para dúvidas, sugestões ou oportunidades de colaboração, entre em contato pelo e-mail: filipeneresfernandes@gmail.com

---

*Desenvolvido com 💻 e ☕ para transformar a gestão de oficinas mecânicas*
