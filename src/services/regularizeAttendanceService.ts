import api from "./api";
import type { RegularizationRequest } from "../models/RegularizeAttendance";
import type {  ManagerPendingRegularizationResponse } from "../models/RegularizeAttendance";
export const getSessionsByDate = async (date: string) => {
    const response = await api.get(`/RegularizeAttendance/sessions?attendanceDate=${date}`);
    return response.data.data;
};
export const submitRegularizationRequest = async (
    request: RegularizationRequest
) => {

    const response = await api.post(
        "/RegularizeAttendance/regularization",
        request
    );

    return response.data;
};
export const getPendingRegularizationRequests = async (): Promise<
    ManagerPendingRegularizationResponse[]
> => {
    const response = await api.get(
        "/RegularizeAttendance/manager/pending"
    );

    return response.data.data;
};