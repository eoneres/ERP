-- CreateTable
CREATE TABLE "empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT,
    "nomeFantasia" TEXT,
    "logoUrl" TEXT,
    "cnpj" TEXT,
    "inscricaoEstadual" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "impostoIss" REAL DEFAULT 0,
    "impostoIcms" REAL DEFAULT 0,
    "comissaoMecanico" REAL DEFAULT 0,
    "toleranciaCancelamentoHoras" INTEGER DEFAULT 2,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
