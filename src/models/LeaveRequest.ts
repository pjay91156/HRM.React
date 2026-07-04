export interface LeaveRequestFormData {
    leaveTypeId: string;
    leaveDuration: number;
    fromDate: string;
    toDate: string;
    reason: string;
    halfDayPeriod:number | null;
}
export interface TeamLeaveRequest {
  leaveRequestId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: string;
  reason: string;
  appliedOn: string;
}

