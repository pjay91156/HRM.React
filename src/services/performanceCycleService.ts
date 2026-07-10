import api from "./api";
import { type PerformanceCycleFormData } from "../models/PerformaceCycle";

const getPerformanceCycles = async () => {
    const response = await api.get("performancecycle");
    return response.data;
};

const getPerformanceCycleById = async (id: string) => {
    const response = await api.get(`performancecycle/${id}`);
    return response.data;
};

const addPerformanceCycle = async (data: PerformanceCycleFormData) => {
    const response = await api.post("performancecycle", data);
    return response.data;
};

const updatePerformanceCycle = async (id: string, data: PerformanceCycleFormData) => {
    const response = await api.put("performancecycle", { id, ...data });
    return response.data;
};

const deletePerformanceCycle = async (id: string) => {
    const response = await api.delete(`performancecycle/${id}`);
    return response.data;
};

const performanceCycleService = {
    getPerformanceCycles,
    getPerformanceCycleById,
    addPerformanceCycle,
    updatePerformanceCycle,
    deletePerformanceCycle
};

export default performanceCycleService;
