export interface PerformanceSkillFormData {
    skillName: string;
    description?: string;
    weightage: number;
    displayOrder: number;
}

export interface PerformanceSkill {
    id: string;
    performanceCategoryId: string;
    skillName: string;
    description?: string | null;
    weightage: number;
    displayOrder: number;
    isActive: boolean;
}
