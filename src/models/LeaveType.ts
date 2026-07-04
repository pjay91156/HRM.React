export interface LeaveTypeResponse {
    id: string;
    leaveName: string;
    leaveCode: string;
    description: string;
    defaultDays: number;
    status: string;
}

export interface LeaveTypeFormData {
    leaveName: string;
    leaveCode: string;
    description: string;
    defaultDays: number | string;
    status: string;
}