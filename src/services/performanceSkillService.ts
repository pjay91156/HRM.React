import api from "./api";
import { type PerformanceSkillFormData } from "../models/PerformanceSkill";

const getPerformanceSkillsByCategory = async (categoryId: string) => {
    const response = await api.get(`performanceskill/bycategory/${categoryId}`);
    return response.data;
};

const getPerformanceSkillById = async (id: string) => {
    const response = await api.get(`performanceskill/${id}`);
    return response.data;
};

const addPerformanceSkill = async (categoryId: string, data: PerformanceSkillFormData) => {
    const response = await api.post("performanceskill", {
        performanceCategoryId: categoryId,
        ...data
    });
    return response.data;
};

const updatePerformanceSkill = async (id: string, data: PerformanceSkillFormData) => {
    const response = await api.put("performanceskill", { id, ...data });
    return response.data;
};

const deletePerformanceSkill = async (id: string) => {
    const response = await api.delete(`performanceskill/${id}`);
    return response.data;
};

const performanceSkillService = {
    getPerformanceSkillsByCategory,
    getPerformanceSkillById,
    addPerformanceSkill,
    updatePerformanceSkill,
    deletePerformanceSkill
};

export default performanceSkillService;
