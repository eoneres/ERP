import api from "./index";

export const empresaAPI = {
    getConfig: async () => {
        const response = await api.get("/empresa");
        return response.data;
    },
    updateConfig: async (dados) => {
        const response = await api.put("/empresa", dados);
        return response.data;
    },
    uploadLogo: async (formData) => {
        const response = await api.post("/empresa/logo", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }
};