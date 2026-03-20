import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./formatters";

/**
 * Exporta dados para Excel
 * @param {Array} data - Array de objetos
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Array} columns - Array de { header: string, accessor: string, formatter?: function }
 */
export const exportToExcel = (data, filename, columns) => {
    // Formatar dados conforme colunas
    const formattedData = data.map(item => {
        const row = {};
        columns.forEach(col => {
            let value = item[col.accessor];
            if (col.formatter && value !== undefined) {
                value = col.formatter(value);
            }
            row[col.header] = value !== undefined && value !== null ? value : "";
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Exporta dados para PDF
 * @param {Array} data - Array de objetos
 * @param {string} title - Título do relatório
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Array} columns - Array de { header: string, accessor: string, formatter?: function }
 */
export const exportToPDF = (data, title, filename, columns) => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Adicionar título
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Preparar colunas e linhas
    const tableColumns = columns.map(col => col.header);
    const tableRows = data.map(item => {
        return columns.map(col => {
            let value = item[col.accessor];
            if (col.formatter && value !== undefined) {
                value = col.formatter(value);
            }
            return value !== undefined && value !== null ? String(value) : "";
        });
    });

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 38,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(`${filename}.pdf`);
};