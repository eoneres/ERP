-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_financeiro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER,
    "tipo" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "valorTotal" REAL NOT NULL,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "descricao" TEXT,
    "categoria" TEXT,
    "fornecedorId" INTEGER,
    "observacoes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "financeiro_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "financeiro_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_financeiro" ("created_at", "dataPagamento", "dataVencimento", "formaPagamento", "id", "observacoes", "ordemServicoId", "parcelas", "status", "tipo", "updated_at", "valorPago", "valorTotal") SELECT "created_at", "dataPagamento", "dataVencimento", "formaPagamento", "id", "observacoes", "ordemServicoId", "parcelas", "status", "tipo", "updated_at", "valorPago", "valorTotal" FROM "financeiro";
DROP TABLE "financeiro";
ALTER TABLE "new_financeiro" RENAME TO "financeiro";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
