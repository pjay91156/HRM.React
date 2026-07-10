import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Building2 } from "lucide-react";
import { type PerformanceTemplate, type PerformanceTemplateFormData } from "../../models/PerformanceTemplate";
import { type Department } from "../../models/Department";
import Loader from "../common/Loader";

const emptyFormValues: PerformanceTemplateFormData = {
    templateName: "",
    description: "",
    departmentId: ""
};

interface AddPerformanceTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PerformanceTemplateFormData) => Promise<void>;
    loading?: boolean;
    editingTemplate?: PerformanceTemplate | null;
    availableDepartments: Department[];
}

const AddPerformanceTemplateModal: React.FC<AddPerformanceTemplateModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitTemplate,
    loading = false,
    editingTemplate = null,
    availableDepartments
}) => {
    const isEditMode = !!editingTemplate;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<PerformanceTemplateFormData>({
        defaultValues: emptyFormValues
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingTemplate) {
            reset({
                templateName: editingTemplate.templateName,
                description: editingTemplate.description ?? "",
                departmentId: editingTemplate.departmentId
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingTemplate, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: PerformanceTemplateFormData) => {
        await onSubmitTemplate(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Performance Template" : "Add Performance Template"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Department */}
                    <div>
                        <label htmlFor="departmentId" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <select
                                id="departmentId"
                                {...register("departmentId", { required: "Please select a department." })}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                           bg-white dark:bg-slate-950
                           pl-11 pr-4 py-2.5
                           text-sm text-gray-900 dark:text-white
                           focus:border-[#6C63FF]
                           focus:ring-2 focus:ring-[#6C63FF]/20
                           focus:outline-none
                           transition-all duration-200"
                            >
                                <option value="">Select a department...</option>
                                {availableDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                            Each department can have only one performance template.
                        </p>
                        {errors.departmentId && (
                            <p className="mt-1 text-sm text-red-500">{errors.departmentId.message}</p>
                        )}
                    </div>

                    {/* Template Name */}
                    <div>
                        <label htmlFor="templateName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Template Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="templateName"
                            {...register("templateName", { required: "Template name is required." })}
                            type="text"
                            placeholder="e.g. Engineering Annual Review"
                            className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       px-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       placeholder:text-gray-400
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200"
                        />
                        {errors.templateName && (
                            <p className="mt-1 text-sm text-red-500">{errors.templateName.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            {...register("description", {
                                maxLength: { value: 500, message: "Description cannot exceed 500 characters." }
                            })}
                            rows={3}
                            placeholder="Briefly describe what this template covers..."
                            className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       px-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       placeholder:text-gray-400
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200 resize-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
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
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Template" : "Save Template"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPerformanceTemplateModal;
