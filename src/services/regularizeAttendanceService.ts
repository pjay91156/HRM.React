import api from "./api";
import type { RegularizationRequest, ManagerPendingRegularizationResponse, RegularizationApprovalRequest, RegularizationDetailsResponse } from "../models/RegularizeAttendance";

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
        "/RegularizeAttendance/manager/requests"
    );

    return response.data.data ?? [];
};

export const approveRejectRegularizationRequest = async (
    request: RegularizationApprovalRequest
) => {
    const response = await api.put(
        "/RegularizeAttendance/manager/approve-reject",
        request
    );

    return response.data;
};

export const getRegularizationDetails = async (
    attendanceId: string,
    employeeId: string
): Promise<RegularizationDetailsResponse | null> => {
    const response = await api.get(
        `/RegularizeAttendance/manager/details/${attendanceId}?employeeId=${employeeId}`
    );

    return response.data?.data ?? null;
};