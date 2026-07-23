import React, { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { FileText, AlignLeft, Tag, Upload } from "lucide-react";
import {
    type CompanyDocument,
    type CompanyDocumentFormData,
    DocumentType,
    DOCUMENT_TYPE_OPTIONS
} from "../../models/CompanyDocument";
import Loader from "../common/Loader";

type CompanyDocumentFieldsData = Omit<CompanyDocumentFormData, "file">;

const emptyFormValues: CompanyDocumentFieldsData = {
    title: "",
    description: "",
    documentType: DocumentType.Policy
};

interface AddCompanyDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CompanyDocumentFormData) => Promise<void>;
    loading?: boolean;
    editingDocument?: CompanyDocument | null;
}

const AddCompanyDocumentModal: React.FC<AddCompanyDocumentModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitDocument,
    loading = false,
    editingDocument = null
}) => {
    const isEditMode = !!editingDocument;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CompanyDocumentFieldsData>({
        defaultValues: emptyFormValues
    });

    useEffect(() => {
        if (!isOpen) return;

        setSelectedFile(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (editingDocument) {
            reset({
                title: editingDocument.title,
                description: editingDocument.description ?? "",
                documentType: editingDocument.documentType
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingDocument, reset]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (file && file.size > 10 * 1024 * 1024) {
            setFileError("File must be 10 MB or smaller.");
            setSelectedFile(null);
            return;
        }

        setFileError(null);
        setSelectedFile(file);
    };

    const onSubmit = async (data: CompanyDocumentFieldsData) => {
        if (!isEditMode && !selectedFile) {
            setFileError("Please choose a file to upload.");
            return;
        }

        await onSubmitDocument({
            title: data.title.trim(),
            description: data.description?.trim() || undefined,
            documentType: Number(data.documentType) as DocumentType,
            file: selectedFile
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Document" : "Upload Document"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                id="title"
                                {...register("title", {
                                    validate: (value) => {
                                        const trimmed = value.trim();
                                        if (!trimmed) return "Title is required and cannot contain only spaces.";
                                        if (trimmed.length > 200) return "Title cannot exceed 200 characters.";
                                        return true;
                                    }
                                })}
                                type="text"
                                placeholder="e.g. Employee Handbook 2026"
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       pl-11 pr-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       placeholder:text-gray-400
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200"
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Document Type */}
                    <div>
                        <label htmlFor="documentType" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <select
                                id="documentType"
                                {...register("documentType", { valueAsNumber: true, required: true })}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       pl-11 pr-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200"
                            >
                                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <AlignLeft size={16} className="absolute left-4 top-3.5 text-indigo-600" />
                            <textarea
                                id="description"
                                rows={3}
                                {...register("description", {
                                    validate: (value) => {
                                        if (value && value.trim().length > 1000) {
                                            return "Description cannot exceed 1000 characters.";
                                        }
                                        return true;
                                    }
                                })}
                                placeholder="Optional notes about this document"
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-950
                         pl-11 pr-4 py-2.5
                         text-sm text-gray-900 dark:text-white
                         placeholder:text-gray-400
                         focus:border-[#6C63FF]
                         focus:ring-2 focus:ring-[#6C63FF]/20
                         focus:outline-none
                         transition-all duration-200 resize-none"
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* File */}
                    <div>
                        <label htmlFor="file" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            File {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                id="file"
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       pl-11 pr-4 py-2
                       text-sm text-gray-900 dark:text-white
                       file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0
                       file:bg-[#6C63FF]/10 file:text-[#6C63FF] file:text-sm file:font-medium
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200"
                            />
                        </div>
                        {isEditMode && (
                            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                                Current file: {editingDocument?.fileName}. Choose a new file only if you want to replace it.
                            </p>
                        )}
                        {fileError && (
                            <p className="mt-1 text-sm text-red-500">{fileError}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600
                   bg-white dark:bg-slate-800
                   text-gray-700 dark:text-slate-300
                   hover:bg-gray-100 dark:hover:bg-slate-700
                   transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg
                   bg-[#6C63FF] text-white
                   hover:bg-[#5B52F5]
                   focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30
                   transition-all duration-200 disabled:opacity-50
                   min-w-[110px] flex items-center justify-center"
                        >
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Document" : "Upload Document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCompanyDocumentModal;
