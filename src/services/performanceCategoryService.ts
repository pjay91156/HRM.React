import api from "./api";
import { type PerformanceCategoryFormData } from "../models/PerformanceCategory";

const getPerformanceCategoriesByTemplate = async (templateId: string) => {
    const response = await api.get(`performancecategory/bytemplate/${templateId}`);
    return response.data;
};

const getPerformanceCategoryById = async (id: string) => {
    const response = await api.get(`performancecategory/${id}`);
    return response.data;
};

const addPerformanceCategory = async (templateId: string, data: PerformanceCategoryFormData) => {
    const response = await api.post("performancecategory", {
        performanceTemplateId: templateId,
        ...data
    });
    return response.data;
};

const updatePerformanceCategory = async (id: string, data: PerformanceCategoryFormData) => {
    const response = await api.put("performancecategory", { id, ...data });
    return response.data;
};

const deletePerformanceCategory = async (id: string) => {
    const response = await api.delete(`performancecategory/${id}`);
    return response.data;
};

const performanceCategoryService = {
    getPerformanceCategoriesByTemplate,
    getPerformanceCategoryById,
    addPerformanceCategory,
    updatePerformanceCategory,
    deletePerformanceCategory
};

export default performanceCategoryService;
