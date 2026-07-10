export interface PerformanceRatingFormData {
    rating: number;
    ratingName: string;
    description?: string;
    displayOrder: number;
}

export interface PerformanceRating {
    id: string;
    rating: number;
    ratingName: string;
    description?: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
}
