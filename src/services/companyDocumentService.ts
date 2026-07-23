import api from "./api";
import { type CompanyDocumentFormData } from "../models/CompanyDocument";

const buildFormData = (data: CompanyDocumentFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) {
        formData.append("description", data.description);
    }
    formData.append("documentType", String(data.documentType));
    if (data.file) {
        formData.append("file", data.file);
    }
    return formData;
};

const getCompanyDocuments = async () => {
    const response = await api.get("companydocument");
    return response.data;
};

const getCompanyDocumentById = async (id: string) => {
    const response = await api.get(`companydocument/${id}`);
    return response.data;
};

const addCompanyDocument = async (data: CompanyDocumentFormData) => {
    const response = await api.post("companydocument", buildFormData(data), {
        headers: { "Content-Type": undefined }
    });
    return response.data;
};

const updateCompanyDocument = async (id: string, data: CompanyDocumentFormData) => {
    const formData = buildFormData(data);
    formData.append("id", id);

    const response = await api.put("companydocument", formData, {
        headers: { "Content-Type": undefined }
    });
    return response.data;
};

const deleteCompanyDocument = async (id: string) => {
    const response = await api.delete(`companydocument/${id}`);
    return response.data;
};

const downloadCompanyDocument = async (id: string, fileName: string) => {
    const response = await api.get(`companydocument/${id}/download`, {
        responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const companyDocumentService = {
    getCompanyDocuments,
    getCompanyDocumentById,
    addCompanyDocument,
    updateCompanyDocument,
    deleteCompanyDocument,
    downloadCompanyDocument
};

export default companyDocumentService;
