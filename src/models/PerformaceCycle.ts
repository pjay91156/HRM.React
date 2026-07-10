export const PerformanceCycleStatus = {
    Draft: 1,
    Active: 2,
    Completed: 3,
    Cancelled: 4,
} as const;

export type PerformanceCycleStatus = typeof PerformanceCycleStatus[keyof typeof PerformanceCycleStatus];
   
export interface PerformanceCycleFormData {
    cycleName: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    employeeReviewStart: string;
    employeeReviewEnd: string;
    managerReviewStart: string;
    managerReviewEnd: string;
    status: PerformanceCycleStatus;
}

export interface PerformanceCycle {
    id: string;
    cycleName: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    employeeReviewStart: string;
    employeeReviewEnd: string;
    managerReviewStart: string;
    managerReviewEnd: string;
    status: PerformanceCycleStatus;
    isActive: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
}