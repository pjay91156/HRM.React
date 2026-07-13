import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Percent, ListOrdered } from "lucide-react";
import { type PerformanceCategory, type PerformanceCategoryFormData } from "../../models/PerformanceCategory";
import Loader from "../common/Loader";

const emptyFormValues: PerformanceCategoryFormData = {
    categoryName: "",
    weightage: 0,
    displayOrder: 1
};

interface AddPerformanceCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PerformanceCategoryFormData) => Promise<void>;
    loading?: boolean;
    editingCategory?: PerformanceCategory | null;
    remainingWeightage: number;
    usedCategoryNames: string[];
    usedDisplayOrders: number[];
}

const AddPerformanceCategoryModal: React.FC<AddPerformanceCategoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitCategory,
    loading = false,
    editingCategory = null,
    remainingWeightage,
    usedCategoryNames,
    usedDisplayOrders
}) => {
    const isEditMode = !!editingCategory;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<PerformanceCategoryFormData>({
        defaultValues: emptyFormValues
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingCategory) {
            reset({
                categoryName: editingCategory.categoryName,
                weightage: editingCategory.weightage,
                displayOrder: editingCategory.displayOrder
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingCategory, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: PerformanceCategoryFormData) => {
        await onSubmitCategory({ ...data, categoryName: data.categoryName.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Skill Category" : "Add Skill Category"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Category Name */}
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="categoryName"
                            {...register("categoryName", {
                                validate: (value) => {
                                    const trimmed = value.trim();
                                    if (!trimmed) return "Category name is required and cannot contain only spaces.";
                                    if (trimmed.length > 100) return "Category name cannot exceed 100 characters.";
                                    if (usedCategoryNames.includes(trimmed.toLowerCase())) {
                                        return "A category with this name already exists in this template.";
                                    }
                                    return true;
                                }
                            })}
                            type="text"
                            placeholder="e.g. Technical Skills"
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
                        {errors.categoryName && (
                            <p className="mt-1 text-sm text-red-500">{errors.categoryName.message}</p>
                        )}
                    </div>

                    {/* Weightage */}
                    <div>
                        <label htmlFor="weightage" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Weightage <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                id="weightage"
                                type="number"
                                step="0.01"
                                {...register("weightage", {
                                    required: "Weightage is required.",
                                    valueAsNumber: true,
                                    validate: (value) => {
                                        if (Number.isNaN(value)) return "Weightage is required.";
                                        if (value <= 0) return "Weightage must be greater than 0.";
                                        if (value > 100) return "Weightage cannot exceed 100%.";
                                        if (value > remainingWeightage) {
                                            return `Total category weightage cannot exceed 100%. Remaining allowed weightage is ${remainingWeightage}%.`;
                                        }
                                        return true;
                                    }
                                })}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-950
                         pl-11 pr-4 py-2.5
                         text-sm text-gray-900 dark:text-white
                         focus:border-[#6C63FF]
                         focus:ring-2 focus:ring-[#6C63FF]/20
                         focus:outline-none
                         transition-all duration-200"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                            {remainingWeightage}% remaining out of 100% for this template.
                        </p>
                        {errors.weightage && (
                            <p className="mt-1 text-sm text-red-500">{errors.weightage.message}</p>
                        )}
                    </div>

                    {/* Display Order */}
                    <div>
                        <label htmlFor="displayOrder" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Display Order <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <ListOrdered size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                id="displayOrder"
                                type="number"
                                min={1}
                                {...register("displayOrder", {
                                    required: "Display order is required.",
                                    valueAsNumber: true,
                                    validate: (value) => {
                                        if (Number.isNaN(value) || value < 1) return "Display order must be at least 1.";
                                        if (usedDisplayOrders.includes(value)) {
                                            return `Display order ${value} is already used in this template.`;
                                        }
                                        return true;
                                    }
                                })}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-950
                         pl-11 pr-4 py-2.5
                         text-sm text-gray-900 dark:text-white
                         focus:border-[#6C63FF]
                         focus:ring-2 focus:ring-[#6C63FF]/20
                         focus:outline-none
                         transition-all duration-200"
                            />
                        </div>
                        {errors.displayOrder && (
                            <p className="mt-1 text-sm text-red-500">{errors.displayOrder.message}</p>
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
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Category" : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPerformanceCategoryModal;
