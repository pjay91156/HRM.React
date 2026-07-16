export interface Review {
    rating: number | null;
    comment: string;
}

export interface Skill {
    id: string;
    skillName: string;
    description: string;
    weightage: number;
    selfReview: Review;
    managerReview: Review;
}

export interface Category {
    id: string;
    categoryName: string;
    weightage: number;
    skills: Skill[];
}

export interface PerformanceReview {
    isEmployee: boolean;
    reviewMode: string;

    performanceCycleName: string;
    reviewPeriod: string;
    employeeReviewPeriod: string;
    managerReviewPeriod: string;

    templateId: string;
    templateName: string;


    isSubmitted: boolean;

    categories: Category[];
}