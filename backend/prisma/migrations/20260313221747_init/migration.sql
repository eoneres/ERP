-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcesso" DATETIME,
    "bloqueadoAte" DATETIME,
    "perfilId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "usuarios_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "permissoes" TEXT
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL DEFAULT 'FISICA',
    "nome" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "documento" TEXT NOT NULL,
    "rg" TEXT,
    "inscricaoEstadual" TEXT,
    "dataNascimento" DATETIME,
    "telefone1" TEXT NOT NULL,
    "telefone2" TEXT,
    "email" TEXT,
    "cep" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placa" TEXT NOT NULL,
    "renavam" TEXT,
    "chassi" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anoFabricacao" INTEGER NOT NULL,
    "anoModelo" INTEGER NOT NULL,
    "cor" TEXT,
    "combustivel" TEXT,
    "cambio" TEXT,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "clienteId" INTEGER NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "veiculos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataHora" DATETIME NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "servicos" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "mecanicoId" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "kmEntrada" INTEGER NOT NULL,
    "kmSaida" INTEGER,
    "dataAbertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "tipo" TEXT NOT NULL DEFAULT 'SERVICO',
    "observacoes" TEXT,
    "mecanicoResponsavelId" INTEGER,
    "agendamentoId" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_mecanicoResponsavelId_fkey" FOREIGN KEY ("mecanicoResponsavelId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicos_os" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorUnitario" REAL NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "mecanicoId" INTEGER,
    "observacoes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "servicos_os_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "servicos_os_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pecas_os" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "pecaId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" REAL NOT NULL,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pecas_os_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pecas_os_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fotos_os" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fotos_os_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pecas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "codigoFabricante" TEXT,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "marca" TEXT,
    "aplicacao" TEXT,
    "localizacao" TEXT,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "estoqueMaximo" INTEGER NOT NULL DEFAULT 0,
    "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
    "precoCusto" REAL NOT NULL,
    "precoVenda" REAL NOT NULL,
    "margemLucro" REAL,
    "fornecedorId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pecas_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "telefone1" TEXT NOT NULL,
    "telefone2" TEXT,
    "email" TEXT,
    "contato" TEXT,
    "cep" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pecaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "motivo" TEXT,
    "documento" TEXT,
    "observacoes" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentacoes_estoque_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "pecas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_estoque_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financeiro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "valorTotal" REAL NOT NULL,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "observacoes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "financeiro_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tentativas_login" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER,
    "ip" TEXT,
    "userAgent" TEXT,
    "sucesso" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tentativas_login_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historico_km" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "veiculoId" INTEGER NOT NULL,
    "kmAnterior" INTEGER NOT NULL,
    "kmNovo" INTEGER NOT NULL,
    "observacao" TEXT,
    "dataRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historico_km_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_nome_key" ON "perfis"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_agendamentoId_key" ON "ordens_servico"("agendamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "pecas_codigo_key" ON "pecas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
