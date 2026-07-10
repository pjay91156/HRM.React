import api from "./api";
import { type PerformanceTemplateFormData } from "../models/PerformanceTemplate";

const getPerformanceTemplates = async () => {
    const response = await api.get("performancetemplate");
    return response.data;
};

const getPerformanceTemplateById = async (id: string) => {
    const response = await api.get(`performancetemplate/${id}`);
    return response.data;
};

const addPerformanceTemplate = async (data: PerformanceTemplateFormData) => {
    const response = await api.post("performancetemplate", data);
    return response.data;
};

const updatePerformanceTemplate = async (id: string, data: PerformanceTemplateFormData) => {
    const response = await api.put("performancetemplate", { id, ...data });
    return response.data;
};

const deletePerformanceTemplate = async (id: string) => {
    const response = await api.delete(`performancetemplate/${id}`);
    return response.data;
};

const performanceTemplateService = {
    getPerformanceTemplates,
    getPerformanceTemplateById,
    addPerformanceTemplate,
    updatePerformanceTemplate,
    deletePerformanceTemplate
};

export default performanceTemplateService;
