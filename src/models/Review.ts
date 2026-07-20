export interface ReviewListItem {
    id: string;
    performanceCycleId: string;
    cycleName: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    employeeReviewStart: string;
    employeeReviewEnd: string;
    managerReviewStart: string;
    managerReviewEnd: string;
    employeeName: string;
    status: string;
    isWindowOpen: boolean;
    isHistory: boolean;
}

export interface ReviewSkill {
    skillId: string;
    skillName: string;
    description: string | null;
    weightage: number;
    employeeRating: number | null;
    employeeComment: string | null;
    managerRating: number | null;
    managerComment: string | null;
}

export interface ReviewCategory {
    categoryId: string;
    categoryName: string;
    weightage: number;
    skills: ReviewSkill[];
}

export interface ReviewDetail {
    id: string;
    cycleName: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    employeeReviewStart: string;
    employeeReviewEnd: string;
    managerReviewStart: string;
    managerReviewEnd: string;
    employeeName: string;
    templateName: string;
    isEmployeeWindowOpen: boolean;
    isManagerWindowOpen: boolean;
    isEmployeeSubmitted: boolean;
    isManagerCompleted: boolean;
    overallEmployeeComment: string | null;
    overallManagerComment: string | null;
    categories: ReviewCategory[];
}

export interface SkillRatingInput {
    skillId: string;
    rating: number | null;
    comment: string;
}
