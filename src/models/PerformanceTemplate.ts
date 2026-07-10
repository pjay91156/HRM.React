export interface PerformanceTemplateFormData {
    templateName: string;
    description?: string;
    departmentId: string;
}

export interface PerformanceTemplate {
    id: string;
    templateName: string;
    description?: string | null;
    departmentId: string;
    departmentName: string;
    isActive: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
}
