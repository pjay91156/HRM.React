import api from "./api";
import { type MeetingRoomBookingFormData, type MeetingRoomBookingFilters } from "../models/MeetingRoomBooking";

const toTimeOnly = (value: string) => (value.length === 5 ? `${value}:00` : value);

const getBookings = async (filters: MeetingRoomBookingFilters = {}) => {
    const response = await api.get("meetingroombooking", { params: filters });
    return response.data;
};

const getMyBookings = async () => {
    const response = await api.get("meetingroombooking/my");
    return response.data;
};

const createBooking = async (data: MeetingRoomBookingFormData) => {
    const response = await api.post("meetingroombooking", {
        ...data,
        startTime: toTimeOnly(data.startTime),
        endTime: toTimeOnly(data.endTime)
    });
    return response.data;
};

const cancelBooking = async (id: string) => {
    const response = await api.put(`meetingroombooking/${id}/cancel`);
    return response.data;
};

const meetingRoomBookingService = {
    getBookings,
    getMyBookings,
    createBooking,
    cancelBooking
};

export default meetingRoomBookingService;
