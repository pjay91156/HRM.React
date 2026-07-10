import React, { useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { ListOrdered } from "lucide-react";
import { type PerformanceRating, type PerformanceRatingFormData } from "../../models/PerformanceRating";
import StarRating from "../common/StarRating";
import Loader from "../common/Loader";

const emptyFormValues: PerformanceRatingFormData = {
    rating: 0,
    ratingName: "",
    description: "",
    displayOrder: 1
};

interface AddPerformanceRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PerformanceRatingFormData) => Promise<void>;
    loading?: boolean;
    editingRating?: PerformanceRating | null;
}

const AddPerformanceRatingModal: React.FC<AddPerformanceRatingModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitRating,
    loading = false,
    editingRating = null
}) => {
    const isEditMode = !!editingRating;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<PerformanceRatingFormData>({
        defaultValues: emptyFormValues
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingRating) {
            reset({
                rating: editingRating.rating,
                ratingName: editingRating.ratingName,
                description: editingRating.description ?? "",
                displayOrder: editingRating.displayOrder
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingRating, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: PerformanceRatingFormData) => {
        await onSubmitRating(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Performance Rating" : "Add Performance Rating"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Rating <span className="text-red-500">*</span>
                        </label>

                        <Controller
                            name="rating"
                            control={control}
                            rules={{
                                validate: (value) =>
                                    (value >= 1 && value <= 5) || "Select a star rating between 1 and 5."
                            }}
                            render={({ field }) => (
                                <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 px-4 py-3">
                                    <StarRating
                                        value={field.value}
                                        interactive
                                        size={26}
                                        onChange={field.onChange}
                                    />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                                        {field.value > 0 ? `${field.value} / 5` : "Not selected"}
                                    </span>
                                </div>
                            )}
                        />
                        {errors.rating && (
                            <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
                        )}
                    </div>

                    {/* Rating Name */}
                    <div>
                        <label htmlFor="ratingName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Rating Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="ratingName"
                            {...register("ratingName", { required: "Rating name is required." })}
                            type="text"
                            placeholder="e.g. Exceeds Expectations"
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
                        {errors.ratingName && (
                            <p className="mt-1 text-sm text-red-500">{errors.ratingName.message}</p>
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
                            placeholder="Briefly describe what this rating represents..."
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
                                    min: { value: 1, message: "Display order must be at least 1." }
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
                            Controls the order this rating appears in lists and dropdowns.
                        </p>
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
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Rating" : "Save Rating"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPerformanceRatingModal;
