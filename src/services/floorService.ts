import api from "./api";
import { type FloorFormData } from "../models/Floor";

const getFloors = async () => {
    const response = await api.get("floor");
    return response.data;
};

const getFloorById = async (id: string) => {
    const response = await api.get(`floor/${id}`);
    return response.data;
};

const addFloor = async (data: FloorFormData) => {
    const response = await api.post("floor", data);
    return response.data;
};

const updateFloor = async (id: string, data: FloorFormData) => {
    const response = await api.put("floor", { id, ...data });
    return response.data;
};

const deleteFloor = async (id: string) => {
    const response = await api.delete(`floor/${id}`);
    return response.data;
};

const floorService = {
    getFloors,
    getFloorById,
    addFloor,
    updateFloor,
    deleteFloor
};

export default floorService;
