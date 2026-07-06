import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import leaveTypeService from "../services/leaveTypeService";
import { type LeaveRequestFormData } from "../models/LeaveRequest";
import leaveRequestService from "../services/leaveRequestService";

interface LeaveType {
    id: string;
    leaveName: string;
}



const LeaveRequest: React.FC = () => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [totalDays, setTotalDays] = useState<number>(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<LeaveRequestFormData>({
        mode: "onSubmit",
        defaultValues: {
            leaveTypeId: "",
            fromDate: "",
            toDate: "",
            leaveDuration: undefined,
            halfDayPeriod: null,
            reason: ""
        }
    });

    const fromDate = watch("fromDate");
    const toDate = watch("toDate");
    const leaveDuration = watch("leaveDuration");

    const fromDateInputRef = useRef<HTMLInputElement | null>(null);
    const toDateInputRef = useRef<HTMLInputElement | null>(null);

    const openFromDatePicker = () => {
        fromDateInputRef.current?.showPicker?.();
        fromDateInputRef.current?.focus();
    };

    const openToDatePicker = () => {
        toDateInputRef.current?.showPicker?.();
        toDateInputRef.current?.focus();
    };

    const formatDate = (value?: string) => {
        if (!value) return "Select date";
        return new Date(value).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const { ref: fromDateRef, ...fromDateRegister } = register("fromDate", {
        required: "From Date is required"
    });

    const { ref: toDateRef, ...toDateRegister } = register("toDate", {
        required: "To Date is required",
        validate: (value) => {
            if (!fromDate) return true;

            const start = new Date(fromDate);
            const end = new Date(value);

            if (leaveDuration === 2 || leaveDuration === 3) {
                if (start.getTime() !== end.getTime()) {
                    return "Select proper date: For Half Day / Short Leave, From Date and To Date must be same";
                }
            }

            if (end < start) {
                return "To Date must be greater than or equal to From Date";
            }

            return true;
        }
    });

    useEffect(() => {
        loadLeaveTypes();
    }, []);

    const loadLeaveTypes = async () => {
        try {
            const response = await leaveTypeService.getLeaveTypes();
            if (response.success) {
                setLeaveTypes(response.data ?? []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!fromDate) {
            setTotalDays(0);
            return;
        }

        if (leaveDuration === 2) {
            setTotalDays(0.5);
            return;
        }

        if (!toDate) {
            setTotalDays(0);
            return;
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);

        const diff = end.getTime() - start.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

        setTotalDays(days > 0 ? days : 0);
    }, [fromDate, toDate, leaveDuration]);

    const onSubmit = async (data: LeaveRequestFormData) => {
        try {
            const response =
                await leaveRequestService.applyLeave(data);

            console.log(response);

            alert("Leave applied successfully");
        }
        catch (error) {
            console.error(error);
            alert("Failed to apply leave");
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        Apply Leave
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Fill the details to apply for leave
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* FORM */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* ✅ ROW 1 (FIXED BUT SAME DESIGN STYLE) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Leave Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">
                                    Leave Type <span className="text-red-500">*</span>
                                </label>

                                <select
                                    {...register("leaveTypeId", {
                                        required: "Leave Type is required"
                                    })}
                                    className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm ${errors.leaveTypeId
                                        ? "border-red-500"
                                        : "border-slate-200"
                                        }`}
                                >
                                    <option value="">Select Leave Type</option>
                                    {leaveTypes.map((lt) => (
                                        <option key={lt.id} value={lt.id}>
                                            {lt.leaveName}
                                        </option>
                                    ))}
                                </select>

                                {errors.leaveTypeId && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.leaveTypeId.message}
                                    </p>
                                )}
                            </div>

                            {/* Leave Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">
                                    Leave Duration
                                </label>

                                <select
                                    {...register("leaveDuration", {
                                        valueAsNumber: true,
                                        required: "Leave Duration is required"
                                    })}
                                    className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm ${errors.leaveDuration ? "border-red-500" : ""
                                        }`}
                                >
                                    <option value="">Select Leave Duration</option>
                                    <option value={1}>Full Day</option>
                                    <option value={2}>Half Day</option>
                                    <option value={3}>Short Leave</option>
                                </select>

                                {errors.leaveDuration && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.leaveDuration.message}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* ✅ ROW 2 (FIXED SAME WAY) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* From Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">
                                    From Date <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={openFromDatePicker}
                                        className={`w-full flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm text-left ${errors.fromDate
                                            ? "border-red-500"
                                            : "border-slate-200"
                                            }`}
                                    >
                                        <CalendarDays size={16} className="text-indigo-600 shrink-0" />
                                        <span className={fromDate ? "text-slate-800" : "text-slate-400"}>
                                            {formatDate(fromDate)}
                                        </span>
                                    </button>

                                    <input
                                        type="date"
                                        {...fromDateRegister}
                                        ref={(el) => {
                                            fromDateRef(el);
                                            fromDateInputRef.current = el;
                                        }}
                                        className="absolute inset-0 opacity-0 pointer-events-none"
                                    />
                                </div>

                                {errors.fromDate && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.fromDate.message}
                                    </p>
                                )}
                            </div>

                            {/* To Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">
                                    To Date <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={openToDatePicker}
                                        className={`w-full flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm text-left ${errors.toDate
                                            ? "border-red-500"
                                            : "border-slate-200"
                                            }`}
                                    >
                                        <CalendarDays size={16} className="text-indigo-600 shrink-0" />
                                        <span className={toDate ? "text-slate-800" : "text-slate-400"}>
                                            {formatDate(toDate)}
                                        </span>
                                    </button>

                                    <input
                                        type="date"
                                        {...toDateRegister}
                                        ref={(el) => {
                                            toDateRef(el);
                                            toDateInputRef.current = el;
                                        }}
                                        className="absolute inset-0 opacity-0 pointer-events-none"
                                    />
                                </div>

                                {errors.toDate && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.toDate.message}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Total Days */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Total Days
                            </label>

                            <input
                                value={totalDays}
                                readOnly
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Reason <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                rows={4}
                                {...register("reason", {
                                    required: "Reason is required"
                                })}
                                className={`w-full rounded-lg border px-4 py-3 text-sm shadow-sm resize-none ${errors.reason
                                    ? "border-red-500"
                                    : "border-slate-200"
                                    }`}
                            />

                            {errors.reason && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.reason.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="rounded-xl bg-[#6C63FF] hover:bg-[#5B52F5] px-5 py-2.5 text-sm font-medium text-white"
                            >
                                Apply Leave
                            </button>
                        </div>

                    </form>
                </div>

                {/* BALANCE (UNCHANGED) */}
                {/* BALANCE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                        Leave Balance
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {/* Casual Leave */}
                        <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                    {/* You can use Lucide-React icons here */}
                                    <span>📅</span>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Casual Leave</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">8.5 <span className="text-sm font-normal text-slate-500">of 12 days</span></p>
                        </div>

                        {/* Sick Leave */}
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <span>💊</span>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Sick Leave</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">6 <span className="text-sm font-normal text-slate-500">of 10 days</span></p>
                        </div>

                        {/* Earned Leave */}
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <span>⭐</span>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Earned Leave</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">12 <span className="text-sm font-normal text-slate-500">of 18 days</span></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaveRequest;