const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const helpers = {
    hashPassword: async (password) => await bcrypt.hash(password, 10),
    comparePassword: async (password, hash) => await bcrypt.compare(password, hash),

    generateToken: (payload) => jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn }),

    formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),

    formatCurrency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),

    generateOsNumber: async (prisma) => {
        const year = new Date().getFullYear();
        const lastOs = await prisma.ordemServico.findFirst({
            where: { numero: { startsWith: `OS-${year}` } },
            orderBy: { numero: 'desc' }
        });

        if (!lastOs) return `OS-${year}-0001`;

        const lastNumber = parseInt(lastOs.numero.split('-')[2]);
        return `OS-${year}-${(lastNumber + 1).toString().padStart(4, '0')}`;
    },

    validateCPF: (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let add = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;

        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(cpf.charAt(10));
    },

    validateCNPJ: (cnpj) => {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho++;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        return resultado === parseInt(digitos.charAt(1));
    }
};

module.exports = helpers;