export interface PerformanceCategoryFormData {
    categoryName: string;
    weightage: number;
    displayOrder: number;
}

export interface PerformanceCategory {
    id: string;
    performanceTemplateId: string;
    categoryName: string;
    weightage: number;
    displayOrder: number;
    isActive: boolean;
}
