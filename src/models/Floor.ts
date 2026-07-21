export interface Floor {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
}

export interface FloorFormData {
    name: string;
    description?: string;
}
