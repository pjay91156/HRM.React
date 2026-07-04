import api from "./api";
import { type LeaveTypeFormData } from "../models/LeaveType";

const getLeaveTypes = async () => {
    const response = await api.get("leavetype");
    debugger;
    return response.data;
};

const addLeaveType = async (data: LeaveTypeFormData) => {
    const response = await api.post("leavetype", data);
    return response.data;
};

const deleteLeaveType = async (id: string) => {
    const response = await api.delete(`leavetype/${id}`);
    return response.data;
};

const leaveTypeService = {
    getLeaveTypes,
    addLeaveType,
    deleteLeaveType
};

export default leaveTypeService;