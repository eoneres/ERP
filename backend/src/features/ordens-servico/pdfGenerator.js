const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.fontsPath = path.join(__dirname, '../../../fonts');
    }

    // Gerar orçamento em PDF
    async gerarOrcamento(os, dadosAdicionais = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });

                // Configurar para retornar buffer
                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Cabeçalho
                this.adicionarCabecalho(doc, dadosAdicionais.empresa || {});

                // Título
                doc.moveDown();
                doc.fontSize(20).text('ORÇAMENTO', { align: 'center' });
                doc.fontSize(12).text(`Nº ${os.numero}`, { align: 'center' });
                doc.moveDown();

                // Informações do cliente
                this.adicionarInfoCliente(doc, os.cliente, os.veiculo);

                // Serviços
                this.adicionarTabelaServicos(doc, os.servicos || []);

                // Peças
                this.adicionarTabelaPecas(doc, os.pecas || []);

                // Totais
                this.adicionarTotais(doc, os);

                // Observações
                if (os.observacoes) {
                    doc.moveDown();
                    doc.fontSize(10).text('Observações:', { underline: true });
                    doc.fontSize(9).text(os.observacoes);
                }

                // Rodapé
                this.adicionarRodape(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Gerar OS em PDF
    async gerarOS(os, dadosAdicionais = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Cabeçalho
                this.adicionarCabecalho(doc, dadosAdicionais.empresa || {});

                // Título
                doc.moveDown();
                doc.fontSize(20).text('ORDEM DE SERVIÇO', { align: 'center' });
                doc.fontSize(12).text(`Nº ${os.numero}`, { align: 'center' });
                doc.fontSize(10).text(`Data: ${new Date(os.dataAbertura).toLocaleDateString('pt-BR')}`, { align: 'center' });
                doc.moveDown();

                // Status
                doc.fontSize(12).fillColor(this.getStatusColor(os.status)).text(`Status: ${this.getStatusLabel(os.status)}`, { align: 'center' });
                doc.fillColor('black');
                doc.moveDown();

                // Informações do cliente
                this.adicionarInfoCliente(doc, os.cliente, os.veiculo);

                // Quilometragem
                doc.moveDown();
                doc.fontSize(10).text(`KM Entrada: ${os.kmEntrada} km`);
                if (os.kmSaida) {
                    doc.text(`KM Saída: ${os.kmSaida} km`);
                }
                doc.moveDown();

                // Serviços executados
                this.adicionarTabelaServicos(doc, os.servicos || [], true);

                // Peças utilizadas
                this.adicionarTabelaPecas(doc, os.pecas || [], true);

                // Totais
                this.adicionarTotais(doc, os);

                // Mecânico responsável
                if (os.mecanico) {
                    doc.moveDown();
                    doc.fontSize(10).text(`Mecânico Responsável: ${os.mecanico.nome}`);
                }

                // Observações
                if (os.observacoes) {
                    doc.moveDown();
                    doc.fontSize(10).text('Observações:', { underline: true });
                    doc.fontSize(9).text(os.observacoes);
                }

                // Assinaturas
                this.adicionarAssinaturas(doc);

                // Rodapé
                this.adicionarRodape(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    adicionarCabecalho(doc, empresa) {
        // Logo (se existir)
        const logoPath = path.join(__dirname, '../../../uploads/logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 30, { width: 80 });
        }

        // Dados da empresa
        doc.fontSize(12).text(empresa.nome || 'Oficina Mecânica', 150, 30, { align: 'right' });
        doc.fontSize(8).text(empresa.endereco || '', 150, 45, { align: 'right' });
        doc.fontSize(8).text(`Tel: ${empresa.telefone || ''}`, 150, 60, { align: 'right' });
        doc.fontSize(8).text(`CNPJ: ${empresa.cnpj || ''}`, 150, 75, { align: 'right' });

        doc.moveDown(4);
    }

    adicionarInfoCliente(doc, cliente, veiculo) {
        doc.fontSize(12).text('Dados do Cliente', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10).text(`Nome: ${cliente.nome}`);
        doc.fontSize(10).text(`Documento: ${cliente.documento}`);
        doc.fontSize(10).text(`Telefone: ${cliente.telefone1}`);
        if (cliente.email) doc.fontSize(10).text(`E-mail: ${cliente.email}`);

        doc.moveDown();
        doc.fontSize(12).text('Dados do Veículo', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10).text(`Placa: ${veiculo.placa}`);
        doc.fontSize(10).text(`Modelo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.anoModelo}`);
        if (veiculo.cor) doc.fontSize(10).text(`Cor: ${veiculo.cor}`);
    }

    adicionarTabelaServicos(doc, servicos, comStatus = false) {
        if (servicos.length === 0) return;

        doc.moveDown();
        doc.fontSize(12).text('Serviços', { underline: true });
        doc.moveDown(0.5);

        // Cabeçalho da tabela
        const tableTop = doc.y;
        const col1 = 50;  // Descrição
        const col2 = 300; // Quantidade
        const col3 = 350; // Valor Unit.
        const col4 = 420; // Desconto
        const col5 = 480; // Total

        doc.fontSize(8);
        doc.text('Descrição', col1, tableTop);
        doc.text('Qtd', col2, tableTop);
        doc.text('Valor Unit.', col3, tableTop);
        doc.text('Desconto', col4, tableTop);
        doc.text('Total', col5, tableTop);

        doc.moveDown();
        let y = doc.y;

        // Linhas da tabela
        servicos.forEach(servico => {
            doc.fontSize(8);
            doc.text(servico.descricao.substring(0, 30), col1, y);
            doc.text(servico.quantidade.toString(), col2, y);
            doc.text(`R$ ${servico.valorUnitario.toFixed(2)}`, col3, y);
            doc.text(`R$ ${servico.desconto.toFixed(2)}`, col4, y);
            doc.text(`R$ ${servico.total.toFixed(2)}`, col5, y);

            if (comStatus && servico.status) {
                doc.text(`Status: ${servico.status}`, col1, y + 15, { width: 500 });
                y += 30;
            } else {
                y += 20;
            }
        });

        doc.y = y;
    }

    adicionarTabelaPecas(doc, pecas, comEstoque = false) {
        if (pecas.length === 0) return;

        doc.moveDown();
        doc.fontSize(12).text('Peças', { underline: true });
        doc.moveDown(0.5);

        // Cabeçalho da tabela
        const tableTop = doc.y;
        const col1 = 50;  // Descrição
        const col2 = 300; // Quantidade
        const col3 = 350; // Valor Unit.
        const col4 = 420; // Desconto
        const col5 = 480; // Total

        doc.fontSize(8);
        doc.text('Descrição', col1, tableTop);
        doc.text('Qtd', col2, tableTop);
        doc.text('Valor Unit.', col3, tableTop);
        doc.text('Desconto', col4, tableTop);
        doc.text('Total', col5, tableTop);

        doc.moveDown();
        let y = doc.y;

        // Linhas da tabela
        pecas.forEach(peca => {
            doc.fontSize(8);
            doc.text(peca.peca.descricao.substring(0, 30), col1, y);
            doc.text(peca.quantidade.toString(), col2, y);
            doc.text(`R$ ${peca.valorUnitario.toFixed(2)}`, col3, y);
            doc.text(`R$ ${peca.desconto.toFixed(2)}`, col4, y);
            doc.text(`R$ ${peca.total.toFixed(2)}`, col5, y);
            y += 20;
        });

        doc.y = y;
    }

    adicionarTotais(doc, os) {
        const subtotalServicos = (os.servicos || []).reduce((acc, s) => acc + s.total, 0);
        const subtotalPecas = (os.pecas || []).reduce((acc, p) => acc + p.total, 0);
        const total = subtotalServicos + subtotalPecas;

        doc.moveDown();
        const y = doc.y;
        const xTotal = 350;

        doc.fontSize(10);
        doc.text('Subtotal Serviços:', xTotal, y);
        doc.text(`R$ ${subtotalServicos.toFixed(2)}`, xTotal + 150, y);

        doc.text('Subtotal Peças:', xTotal, y + 20);
        doc.text(`R$ ${subtotalPecas.toFixed(2)}`, xTotal + 150, y + 20);

        doc.moveDown(2);
        doc.fontSize(12);
        doc.text('TOTAL:', xTotal, doc.y);
        doc.text(`R$ ${total.toFixed(2)}`, xTotal + 150, doc.y);
    }

    adicionarAssinaturas(doc) {
        doc.moveDown(4);
        const y = doc.y;

        doc.fontSize(10);
        doc.text('__________________________', 50, y);
        doc.text('__________________________', 350, y);

        doc.text('Assinatura do Cliente', 70, y + 20);
        doc.text('Assinatura do Responsável', 370, y + 20);
    }

    adicionarRodape(doc) {
        doc.fontSize(8);
        doc.text(
            `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
            50,
            doc.page.height - 50,
            { align: 'center', width: 500 }
        );
    }

    getStatusColor(status) {
        const colors = {
            ABERTA: 'blue',
            AGUARDANDO_APROVACAO: 'orange',
            APROVADA: 'green',
            EM_EXECUCAO: 'purple',
            CONCLUIDA: 'darkgreen',
            ENTREGUE: 'green',
            CANCELADA: 'red'
        };
        return colors[status] || 'black';
    }

    getStatusLabel(status) {
        const labels = {
            ABERTA: 'Aberta',
            AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
            APROVADA: 'Aprovada',
            EM_EXECUCAO: 'Em Execução',
            CONCLUIDA: 'Concluída',
            ENTREGUE: 'Entregue',
            CANCELADA: 'Cancelada'
        };
        return labels[status] || status;
    }
}

module.exports = new PDFGenerator();