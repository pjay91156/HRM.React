import React, { useRef, useState, useEffect } from "react";
import { CalendarDays, PlusCircle, Clock3 } from "lucide-react";
import { getSessionsByDate } from "../services/regularizeAttendanceService";
import { type AttendanceSessionsResponse } from "../models/RegularizeAttendance";
import Loader from "../components/common/Loader";
import AttendanceRegularizationModal from "../components/modals/RegulizationRequestModal";
import { submitRegularizationRequest } from "../services/regularizeAttendanceService";

const RegularizeAttendance: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendanceData, setAttendanceData] = useState<AttendanceSessionsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [isRegularizationModalOpen, setIsRegularizationModalOpen] = useState(false);

    const openDatePicker = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker?.();
            dateInputRef.current.focus();
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getSessionsByDate(selectedDate);
            setAttendanceData(data);
        } catch (error) {
            console.error("Error loading sessions:", error);
            setAttendanceData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (value?: string | null) => {
        if (!value) return "--";
        return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const formatWorkingHours = (hours?: number) => {
        if (!hours) return "00h 00m";
        const totalMinutes = Math.round(hours * 60);
        return `${Math.floor(totalMinutes / 60).toString().padStart(2, "0")}h ${(totalMinutes % 60).toString().padStart(2, "0")}m`;
    };

    return (
        <div className="space-y-6 max-w-[1600px]">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Attendance</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and regularize your daily sessions</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={openDatePicker}
                            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-indigo-300 transition-all shadow-sm"
                        >
                            <CalendarDays size={16} className="text-indigo-600" />
                            {new Date(selectedDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </button>

                        <input
                            ref={dateInputRef}
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="absolute opacity-0 pointer-events-none"
                        />
                    </div>
                    <button onClick={() => setIsRegularizationModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm">

                        <PlusCircle size={16} />
                        Add Regularization Request
                    </button>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {isLoading && (
                    <div className="absolute inset-x-0 bottom-0 top-[45px] z-40 bg-white/60 backdrop-blur-[1px] transition-all">
                        <Loader />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="relative z-30 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-6 font-semibold">Session</th>
                                <th className="py-3.5 px-4 font-semibold">Check In</th>
                                <th className="py-3.5 px-4 font-semibold">Check Out</th>
                                <th className="py-3.5 px-6 font-semibold text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendanceData?.sessions.map((session, i) => (
                                <tr key={i} className="group hover:bg-slate-50/70 transition-colors">
                                    <td className="py-4 px-6 font-medium text-slate-900 text-sm">Session #{i + 1}</td>
                                    <td className="py-4 px-4 text-sm text-slate-600">{formatTime(session.checkIn)}</td>
                                    <td className="py-4 px-4 text-sm text-slate-600">{formatTime(session.checkOut)}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-indigo-600 text-right">
                                        {formatWorkingHours(session.workingHours)}
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && (!attendanceData?.sessions || attendanceData.sessions.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center text-slate-400 text-sm">
                                        No attendance sessions found for this date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50/50">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-slate-900">Total Working Hours</td>
                                <td className="px-6 py-4 text-sm font-bold text-indigo-700 text-right">
                                    {formatWorkingHours(attendanceData?.totalWorkingHours)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <AttendanceRegularizationModal
                    isOpen={isRegularizationModalOpen}
                    attendanceDate={new Date(selectedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                    attendanceData={attendanceData}
                    onClose={() => setIsRegularizationModalOpen(false)}
                />
            </div>
        </div>


    );
};

export default RegularizeAttendance;