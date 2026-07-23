export const DocumentType = {
    Policy: 1,
    KRA: 2,
    Certificate: 3,
    Form: 4,
    Other: 5,
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: DocumentType.Policy, label: "HR Policy" },
    { value: DocumentType.KRA, label: "KRA" },
    { value: DocumentType.Certificate, label: "Certifications" },
    { value: DocumentType.Form, label: "Form" },
    { value: DocumentType.Other, label: "Other" },
];

export const getDocumentTypeLabel = (documentType: DocumentType): string =>
    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentType)?.label ?? "Other";

export interface CompanyDocument {
    id: string;
    title: string;
    description: string | null;
    documentType: DocumentType;
    documentTypeName: string;
    fileName: string;
    fileExtension: string;
    contentType: string;
    fileSize: number;
    isActive: boolean;
    createdAt: string;
}

export interface CompanyDocumentFormData {
    title: string;
    description?: string;
    documentType: DocumentType;
    file?: File | null;
}
