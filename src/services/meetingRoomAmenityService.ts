import api from "./api";
import { type MeetingRoomAmenityFormData } from "../models/MeetingRoomAmenity";

const getAmenities = async () => {
    const response = await api.get("meetingroomamenity");
    return response.data;
};

const getAmenityById = async (id: string) => {
    const response = await api.get(`meetingroomamenity/${id}`);
    return response.data;
};

const addAmenity = async (data: MeetingRoomAmenityFormData) => {
    const response = await api.post("meetingroomamenity", data);
    return response.data;
};

const updateAmenity = async (id: string, data: MeetingRoomAmenityFormData) => {
    const response = await api.put("meetingroomamenity", { id, ...data });
    return response.data;
};

const deleteAmenity = async (id: string) => {
    const response = await api.delete(`meetingroomamenity/${id}`);
    return response.data;
};

const meetingRoomAmenityService = {
    getAmenities,
    getAmenityById,
    addAmenity,
    updateAmenity,
    deleteAmenity
};

export default meetingRoomAmenityService;
