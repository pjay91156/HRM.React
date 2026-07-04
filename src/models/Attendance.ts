export interface AttendanceSessionResponse {
    id: string;
    sessionNumber: number;
    checkInTime: string;
    checkOutTime: string | null;
    workingHours: number;
    status: string;
}

export interface TodayAttendanceResponse {
    attendanceId: string;
    attendanceDate: string;
    totalWorkingHours: number;
    canCheckIn: boolean;
    canCheckOut: boolean;
    sessions: AttendanceSessionResponse[];
}
export interface AttendanceSummaryResponse {
    firstCheckIn: string | null;
    lastCheckOut: string | null;
    totalWorkingHours: number;
}
export interface WeeklyAttendanceDayResponse {

    date: string;

    workingHours: number;

    isPresent: boolean;
}

export interface WeeklyAttendanceSummaryResponse {

    days: WeeklyAttendanceDayResponse[];
}
// models/Attendance.ts

export interface TeamAttendanceSummaryResponse {
  totalEmployees: number;
  presentEmployees: number;
  absentEmployees: number;
  onLeaveEmployees: number;
}
export interface TeamAttendanceFilter {
    managerId: string | null;
    searchText: string;
    attendanceDate: string;
    pageNumber: number;
    pageLength: number;
}

export interface TeamAttendanceItem {
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    reportingManager: string;
    firstCheckIn: string | null;
    lastCheckOut: string | null;
    totalWorkingHours: number;
    status: string;
}

export interface TeamAttendanceResponse {
    totalRecords: number;
    records: TeamAttendanceItem[];
}