import api from "./api";
import { type LeaveRequestFormData } from "../models/LeaveRequest";

const applyLeave = async (data: LeaveRequestFormData) => {
    const response = await api.post("/LeaveRequest", data);
    return response.data;
};

// Add this new function to fetch the list
const getMyLeaves = async () => {
    const response = await api.get("/LeaveRequest"); 
    return response.data;
};
const getTeamLeaves = async () => {
    const response = await api.get("LeaveRequest/myteamleaverequests");
    return response.data;
};
const approveRejectLeave = async (data: {
    leaveRequestId: string;
    status: number;
    comments?: string;
}) => {

    const response = await api.put(
        "LeaveRequest/approve-reject",
        data
    );

    return response.data;
};
const getTeamLeaveCalendar = async () => {
    const response = await api.get(
        "leaveRequest/team-calendar"
    );

    return response.data;
};

export default {
    applyLeave,
    getMyLeaves,
    getTeamLeaves,
    approveRejectLeave,
    getTeamLeaveCalendar
};