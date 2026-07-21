export interface MeetingRoomAmenity {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
}

export interface MeetingRoomAmenityFormData {
    name: string;
    description?: string;
}
