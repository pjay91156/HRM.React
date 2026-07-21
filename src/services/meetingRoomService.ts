import api from "./api";
import { type MeetingRoomFormData } from "../models/MeetingRoom";

const getMeetingRooms = async (floorId?: string) => {
    const response = await api.get("meetingroom", {
        params: floorId ? { floorId } : undefined
    });
    return response.data;
};

const getMeetingRoomById = async (id: string) => {
    const response = await api.get(`meetingroom/${id}`);
    return response.data;
};

const addMeetingRoom = async (data: MeetingRoomFormData) => {
    const response = await api.post("meetingroom", data);
    return response.data;
};

const updateMeetingRoom = async (id: string, data: MeetingRoomFormData) => {
    const response = await api.put("meetingroom", { id, ...data });
    return response.data;
};

const deleteMeetingRoom = async (id: string) => {
    const response = await api.delete(`meetingroom/${id}`);
    return response.data;
};

const meetingRoomService = {
    getMeetingRooms,
    getMeetingRoomById,
    addMeetingRoom,
    updateMeetingRoom,
    deleteMeetingRoom
};

export default meetingRoomService;
