// models/Attendance.ts

export interface SessionResponse {
    // Ensure these property names match exactly what your C# API returns
    // (Watch for JSON naming conventions, usually camelCase)
    sessionId:string;
    checkIn: string;
    checkOut: string;
    workingHours: number;
    status?: string; 
    // Add other properties if they exist in your C# SessionResponse class
}

export interface AttendanceSessionsResponse {
    attendanceId: string;
    attendanceDate: string; // DateOnly is typically sent as a string (YYYY-MM-DD)
    totalWorkingHours: number; // decimal in C# becomes number in TS
    sessions: SessionResponse[];
}
export interface SessionChange {
    sessionId: string;
    changeType: "edit" | "add" | "delete";
    before: {
        checkIn: string;
        checkOut: string;
    };
    after: {
        checkIn: string;
        checkOut: string;
    };
}
export interface RegularizationRequest {
    attendanceId: string;
    reason: string;
    sessionChanges: SessionChange[];
}
export interface ManagerPendingRegularizationResponse {
    attendanceId: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    attendanceDate: string;
    requestedOn: string;
    reason: string;
    totalChanges: number;
    changeTypes: string;
    status: string;
}