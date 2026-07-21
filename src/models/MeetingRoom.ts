import { type MeetingRoomAmenity } from "./MeetingRoomAmenity";

export interface MeetingRoom {
    id: string;
    floorId: string;
    floorName: string;
    name: string;
    capacity: number;
    description: string | null;
    isActive: boolean;
    amenities: MeetingRoomAmenity[];
}

export interface MeetingRoomFormData {
    floorId: string;
    name: string;
    capacity: number;
    description?: string;
    amenityIds: string[];
}
