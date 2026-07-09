import { PerformanceCycleStatus, type PerformanceCycleFormData } from "../../models/PerformaceCycle";
import { CalendarDays } from "lucide-react";
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from "react-hook-form";
interface AddPerformanceCycleProps {
    isOpen: boolean;
    onClose: () => void;
}
const AddPerformanceCycleModal: React.FC<AddPerformanceCycleProps> = ({
    isOpen,
    onClose

}) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<PerformanceCycleFormData>({
        defaultValues: {
            cycleName: "",
            reviewPeriodStart: "",
            reviewPeriodEnd: "",
            employeeReviewStart: "",
            employeeReviewEnd: "",
            managerReviewStart: "",
            managerReviewEnd: "",
            status: PerformanceCycleStatus.Draft
        }
    });
    const reviewPeriodStart = watch("reviewPeriodStart");
    const reviewPeriodEnd = watch("reviewPeriodEnd");
    const employeeReviewStart = watch("employeeReviewStart");
    const employeeReviewEnd = watch("employeeReviewEnd");
    const managerReviewStart = watch("managerReviewStart");
    const managerReviewEnd = watch("managerReviewEnd");

    const reviewStartInputRef = useRef<HTMLInputElement | null>(null);
    const reviewEndInputRef = useRef<HTMLInputElement | null>(null);

    const employeeStartInputRef = useRef<HTMLInputElement | null>(null);
    const employeeEndInputRef = useRef<HTMLInputElement | null>(null);

    const managerStartInputRef = useRef<HTMLInputElement | null>(null);
    const managerEndInputRef = useRef<HTMLInputElement | null>(null);

    const openReviewStartDatePicker = () => {
        reviewStartInputRef.current?.showPicker?.();
        reviewStartInputRef.current?.focus();
    };
    const openReviewEndDatePicker = () => {
        reviewEndInputRef.current?.showPicker?.();
        reviewEndInputRef.current?.focus();
    };
    const openEmployeeStartDatePicker = () => {
        employeeStartInputRef.current?.showPicker?.();
        employeeStartInputRef.current?.focus();
    };
    const openEmployeeEndDatePicker = () => {
        employeeEndInputRef.current?.showPicker?.();
        employeeEndInputRef.current?.focus();
    };

    const openManagerStartDatePicker = () => {
        managerStartInputRef.current?.showPicker?.();
        managerStartInputRef.current?.focus();
    };
    const openManagerEndDatePicker = () => {
        managerEndInputRef.current?.showPicker?.();
        managerEndInputRef.current?.focus();
    };


    const formatDate = (value?: string) => {
        if (!value) return "Select date";
        return new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };
    const performanceCycleStatusOptions = [
        {
            value: PerformanceCycleStatus.Draft,
            label: "Draft"
        },
        {
            value: PerformanceCycleStatus.Active,
            label: "Active"
        },
        {
            value: PerformanceCycleStatus.Completed,
            label: "Completed"
        },
        {
            value: PerformanceCycleStatus.Cancelled,
            label: "Cancelled"
        }
    ];
    if (!isOpen) return null;

    const onSubmit = (data: PerformanceCycleFormData) => {

        console.log(data);

    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-xl">

                {/* Header (Sticky at top) */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Performance Cycle</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-6">

                    {/* Cycle Name */}
                    <div>
                        <label
                            htmlFor="cycleName"
                            className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                        >
                            Cycle Name <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="cycleName"
                            {...register("cycleName", {
                                required: "Cycle Name is required."
                            })}
                            type="text"
                            placeholder="e.g. FY 2026 Annual Review"
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
                        {errors.cycleName && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.cycleName.message}
                            </p>
                        )}
                    </div>
                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2"
                        >
                            Status <span className="text-red-500">*</span>
                        </label>

                        <select
                            id="status"
                            {...register("status", {
                                required: "Status is required."
                            })}
                            className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                   bg-white dark:bg-slate-950
                   px-4 py-2.5
                   text-sm text-gray-900 dark:text-white
                   focus:border-[#6C63FF]
                   focus:ring-2 focus:ring-[#6C63FF]/20
                   focus:outline-none
                   transition-all duration-200"
                        >
                            {performanceCycleStatusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        {
                            errors.status &&
                            <p className="mt-1 text-sm text-red-500">
                                {errors.status.message}
                            </p>
                        }
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>

                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Review Period
                        </h3>

                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Review Period Start */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openReviewStartDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />

                                    <span
                                        className={
                                            reviewPeriodStart
                                                ? "text-slate-800 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }
                                    >
                                        {formatDate(reviewPeriodStart)}
                                    </span>
                                </button>
                                {errors.reviewPeriodStart && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.reviewPeriodStart.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                    {...register("reviewPeriodStart", {
                                        required: "Review Period Start Date is required."
                                    })}
                                    ref={(e) => {
                                        register("reviewPeriodStart").ref(e);
                                        reviewStartInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("reviewPeriodStart", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Review Period End */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openReviewEndDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />

                                    <span
                                        className={
                                            reviewPeriodEnd
                                                ? "text-slate-800 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }
                                    >
                                        {formatDate(reviewPeriodEnd)}
                                    </span>
                                </button>

                                {errors.reviewPeriodEnd && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.reviewPeriodEnd.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                    {...register("reviewPeriodEnd", {
                                        required: "Review Period End Date is required.",
                                        validate: (value) => {

                                            const start = new Date(reviewPeriodStart);
                                            const end = new Date(value);

                                            if (end <= start) {
                                                return "Review Period End Date must be greater than Review Period Start Date.";
                                            }

                                            const months =
                                                (end.getFullYear() - start.getFullYear()) * 12 +
                                                (end.getMonth() - start.getMonth());

                                            if (months < 5) {
                                                return "Review Period must be at least 5 months.";
                                            }

                                            return true;
                                        }
                                    })}
                                    ref={(e) => {
                                        register("reviewPeriodEnd").ref(e);
                                        reviewEndInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("reviewPeriodEnd", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                    {/* ---------------- Employee Review ---------------- */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>

                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Employee Review
                        </h3>

                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Employee Review Start */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openEmployeeStartDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />


                                    <span
                                        className={
                                            employeeReviewStart
                                                ? "text-slate-800 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }
                                    >
                                        {formatDate(employeeReviewStart)}
                                    </span>
                                </button>
                                {errors.employeeReviewStart && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.employeeReviewStart.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                    {...register("employeeReviewStart", {
                                        required: "Employee Review Start Date is required.",
                                        validate: (value) => {

                                            if (new Date(value) <= new Date(reviewPeriodEnd)) {

                                                return "Employee Review Start Date must be greater than Review Period End Date.";

                                            }

                                            return true;

                                        }
                                    })}
                                    ref={(e) => {
                                        register("employeeReviewStart").ref(e);
                                        employeeStartInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("employeeReviewStart", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Employee Review End */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openEmployeeEndDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />


                                    <span
                                        className={
                                            employeeReviewEnd
                                                ? "text-slate-800 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }
                                    >
                                        {formatDate(employeeReviewEnd)}
                                    </span>
                                </button>
                                {errors.employeeReviewEnd && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.employeeReviewEnd.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                    {...register("employeeReviewEnd", {
                                        required: "Employee Review End Date is required.",
                                        validate: (value) => {

                                            if (new Date(value) <= new Date(employeeReviewStart)) {

                                                return "Employee Review End Date must be greater than Employee Review Start Date.";

                                            }

                                            return true;

                                        }
                                    })}
                                    ref={(e) => {
                                        register("employeeReviewEnd").ref(e);
                                        employeeEndInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("employeeReviewEnd", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                    {/* ---------------- Manager Review ---------------- */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>

                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Manager Review
                        </h3>

                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Manager Review Start */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openManagerStartDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />



                                    <span
                                        className={
                                            managerReviewStart
                                                ? "text-slate-800 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }
                                    >
                                        {formatDate(managerReviewStart)}
                                    </span>
                                </button>
                                {errors.managerReviewStart && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.managerReviewStart.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                    {...register("managerReviewStart", {
                                        required: "Manager Review Start Date is required.",
                                        validate: (value) => {

                                            if (new Date(value) <= new Date(employeeReviewEnd)) {

                                                return "Manager Review Start Date must be greater than Employee Review End Date.";

                                            }

                                            return true;

                                        }
                                    })}
                                    ref={(e) => {
                                        register("managerReviewStart").ref(e);
                                        managerStartInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("managerReviewStart", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Manager Review End */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={openManagerEndDatePicker}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm shadow-sm text-left"
                                >
                                    <CalendarDays size={16} className="text-indigo-600 shrink-0" />

                                    <span className={managerReviewEnd
                                        ? "text-slate-800 dark:text-slate-200"
                                        : "text-slate-400 dark:text-slate-500"}>
                                        {formatDate(managerReviewEnd)}
                                    </span>
                                </button>
                                {errors.managerReviewEnd && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.managerReviewEnd.message}
                                    </p>
                                )}
                                <input
                                    type="date"
                                    {...register("managerReviewEnd", {
                                        required: "Manager Review End Date is required.", validate: (value) => {

                                            if (new Date(value) <= new Date(managerReviewStart)) {

                                                return "Manager Review End Date must be greater than Manager Review Start Date.";

                                            }

                                            return true;

                                        }
                                    })}
                                    ref={(e) => {
                                        register("managerReviewEnd").ref(e);
                                        managerEndInputRef.current = e;
                                    }}
                                    onChange={(e) => {
                                        setValue("managerReviewEnd", e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true
                                        });
                                    }}
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                />
                            </div>
                        </div>

                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-xl">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600
                   bg-white dark:bg-slate-800
                   text-gray-700 dark:text-slate-300
                   hover:bg-gray-100 dark:hover:bg-slate-700
                   transition-all duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium rounded-lg
                   bg-[#6C63FF] text-white
                   hover:bg-[#5B52F5]
                   focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30
                   transition-all duration-200"
                        >
                            Save
                        </button>

                    </div>
                </form>


                {/* Footer */}


            </div>
        </div>
    );
}
export default AddPerformanceCycleModal;