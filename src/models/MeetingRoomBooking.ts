export interface MeetingRoomBooking {
    id: string;
    meetingRoomId: string;
    meetingRoomName: string;
    floorId: string;
    floorName: string;
    employeeId: string;
    employeeName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    numberOfAttendees: number | null;
    status: "Confirmed" | "Cancelled";
    canCancel: boolean;
}

export interface MeetingRoomBookingFormData {
    meetingRoomId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    numberOfAttendees?: number;
}

export interface MeetingRoomBookingFilters {
    floorId?: string;
    meetingRoomId?: string;
    fromDate?: string;
    toDate?: string;
    status?: "Confirmed" | "Cancelled";
}
