import api from "./api";
import { type TodayAttendanceResponse, type AttendanceSummaryResponse, type WeeklyAttendanceSummaryResponse,
    type TeamAttendanceSummaryResponse,
type TeamAttendanceFilter,
  type  TeamAttendanceResponse } from "../models/Attendance";

export const checkIn = async () => {
    const response = await api.post("attendance/checkin");
    return response.data;
};

export const checkOut = async () => {
    const response = await api.post("attendance/checkout");
    return response.data;
};
export const getTodayAttendance = async (): Promise<TodayAttendanceResponse> => {
    const response = await api.get("attendance/today");

    return response.data.data;
};

export const getAttendanceSummary =
    async (): Promise<AttendanceSummaryResponse> => {

        const response = await api.get("attendance/summary");

        return response.data;
    };
export const getWeeklySummary =
    async (): Promise<WeeklyAttendanceSummaryResponse> => {

        const response = await api.get("attendance/weekly-summary");

        return response.data;
    };
export const getAttendanceSummaryByDate = async (date: string): Promise<TeamAttendanceSummaryResponse> => {
    // Sending data via query parameters
    const response = await api.get(`attendance/teamsummary?attendanceDate=${date}`);
    return response.data.data;
};
export const getTeamAttendance = async (
    request: TeamAttendanceFilter
): Promise<TeamAttendanceResponse> => {

    const response = await api.post(
        "attendance/team-attendance",
        request
    );

    return response.data.data;
};
