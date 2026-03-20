export const formatDocument = (doc) => {
    if (!doc) return "-";

    const numbers = doc.replace(/\D/g, "");

    if (numbers.length === 11) {
        // CPF: 000.000.000-00
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (numbers.length === 14) {
        // CNPJ: 00.000.000/0000-00
        return numbers.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5"
        );
    }

    return doc;
};

export const formatPhone = (phone) => {
    if (!phone) return "-";

    const numbers = phone.replace(/\D/g, "");

    if (numbers.length === 11) {
        // Celular: (00) 00000-0000
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numbers.length === 10) {
        // Fixo: (00) 0000-0000
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phone;
};

export const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
};

export const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatPlate = (plate) => {
    if (!plate) return "";

    // Remove caracteres não alfanuméricos
    const cleaned = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // Formato Mercosul: ABC1D23 ou ABC-1234
    if (cleaned.length === 7) {
        return cleaned.replace(/([A-Z]{3})([0-9])([A-Z])([0-9]{2})/, "$1$2$3$4");
    }

    return cleaned;
};