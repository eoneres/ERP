// Utilitários de formatação para dados
const formatters = {
    // Remove tudo que não é número
    onlyNumbers: (value) => {
        if (!value) return null;
        return value.replace(/[^\d]/g, '');
    },

    // Formata CPF (000.000.000-00)
    formatCPF: (cpf) => {
        const numbers = formatters.onlyNumbers(cpf);
        if (!numbers || numbers.length !== 11) return cpf;
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Formata CNPJ (00.000.000/0000-00)
    formatCNPJ: (cnpj) => {
        const numbers = formatters.onlyNumbers(cnpj);
        if (!numbers || numbers.length !== 14) return cnpj;
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },

    // Formata telefone
    formatPhone: (phone) => {
        const numbers = formatters.onlyNumbers(phone);
        if (!numbers) return phone;
        if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },

    // Formata CEP
    formatCEP: (cep) => {
        const numbers = formatters.onlyNumbers(cep);
        if (!numbers || numbers.length !== 8) return cep;
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
};

module.exports = formatters;