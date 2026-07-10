import api from "./api";
import { type PerformanceRatingFormData } from "../models/PerformanceRating";

const getPerformanceRatings = async () => {
    const response = await api.get("performancerating");
    return response.data;
};

const getPerformanceRatingById = async (id: string) => {
    const response = await api.get(`performancerating/${id}`);
    return response.data;
};

const addPerformanceRating = async (data: PerformanceRatingFormData) => {
    const response = await api.post("performancerating", data);
    return response.data;
};

const updatePerformanceRating = async (id: string, data: PerformanceRatingFormData) => {
    const response = await api.put("performancerating", { id, ...data });
    return response.data;
};

const deletePerformanceRating = async (id: string) => {
    const response = await api.delete(`performancerating/${id}`);
    return response.data;
};

const performanceRatingService = {
    getPerformanceRatings,
    getPerformanceRatingById,
    addPerformanceRating,
    updatePerformanceRating,
    deletePerformanceRating
};

export default performanceRatingService;
