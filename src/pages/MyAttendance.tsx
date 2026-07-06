import React, { useRef, useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import {
    LogIn,
    LogOut,
    Clock3,
    Info

} from "lucide-react";
import { checkIn, checkOut } from "../services/attendanceService";
import { type AttendanceSummaryResponse, type TodayAttendanceResponse, type WeeklyAttendanceSummaryResponse } from "../models/Attendance";
import { getAttendanceSummary, getTodayAttendance, getWeeklySummary } from "../services/attendanceService";
import Loader from "../components/common/Loader";


const MyAttendance: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [canCheckIn, setCanCheckIn] = useState(true);
    const [canCheckOut, setCanCheckOut] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [attendanceHistory, setAttendanceHistory] =
        useState<TodayAttendanceResponse | null>(null);
    const [weeklySummary, setWeeklySummary] =
        useState<WeeklyAttendanceSummaryResponse | null>(null);

    const openDatePicker = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker?.();
            dateInputRef.current.focus();
        }
    };

    const isToday = selectedDate === new Date().toISOString().split("T")[0];

    const dateLabel = isToday
        ? "Today"
        : new Date(selectedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const loadWeeklySummary = async () => {

        try {

            const response = await getWeeklySummary(selectedDate);

            setWeeklySummary(response);

        }
        catch (error) {

            console.error(error);

        }

    };
    const loadAttendanceHistory = async () => {
        try {

            const data = await getTodayAttendance(selectedDate);

            setAttendanceHistory(data);

            if (isToday && data.canCheckOut) {
                setCanCheckIn(false);
                setCanCheckOut(true);
            } else {
                setCanCheckIn(isToday);
                setCanCheckOut(false);
            }

        }
        catch (error) {
            console.error(error);
        }
        finally {

        }
    };
    const [attendance, setAttendance] =
        useState<AttendanceSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.allSettled([
                loadAttendance(),
                loadAttendanceHistory(),
                loadWeeklySummary(),
            ]);
            setLoading(false);
        };

        loadAll();
    }, [selectedDate]);

    const loadAttendance = async () => {
        const data = await getAttendanceSummary(selectedDate);
        setAttendance(data);
    };

    const firstCheckIn = attendance?.firstCheckIn ?? null;



    const lastCheckOut = attendance?.lastCheckOut ?? null;

    const formatTime = (value?: string | null) => {
        if (!value) return "--";

        return new Date(value).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatWorkingHours = (hours?: number) => {

        if (!hours)
            return "00h 00m";

        const totalMinutes = Math.round(hours * 60);

        const h = Math.floor(totalMinutes / 60);

        const m = totalMinutes % 60;

        return `${h.toString().padStart(2, "0")}h ${m
            .toString()
            .padStart(2, "0")}m`;
    };

    const handleCheckOut = async () => {
        try {
            const response = await checkOut();

            console.log(response);

            setCanCheckIn(true);
            setCanCheckOut(false);

            loadAttendance();
            loadAttendanceHistory();
            loadWeeklySummary();
        } catch (error: any) {
            console.error(error);

            // Optional
            // toast.error(error.response?.data?.message || "Failed to check out");
        }
    };
    const handleCheckIn = async () => {
        try {
            const response = await checkIn();

            console.log(response);

            setCanCheckIn(false);
            setCanCheckOut(true);
            loadAttendance();
            loadAttendanceHistory();
            loadWeeklySummary();

            // Optional: Refresh dashboard data
            // await loadDashboard();
        } catch (error: any) {
            console.error(error);

            // Optional
            // toast.error(error.response?.data?.message || "Failed to check in");
        }
    };


    return (
        <div className="relative space-y-6 w-full max-w-7xl mx-auto">

            {loading && (
                <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                    <Loader />
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        My Attendance
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Track your daily attendance sessions
                    </p>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={openDatePicker}
                        className="
                            flex
                            items-center
                            gap-3
                            bg-white border border-gray-200 rounded-xl
                            px-5
                            py-3
                            shadow-md
                            hover:bg-white-200
                            transition-all
                            w-full
                            lg:w-auto
                        "
                    >
                        <CalendarDays
                            size={20}
                            className="text-blue-600"
                        />

                        <span className="font-semibold text-slate-800">
                            {new Date(selectedDate).toLocaleDateString(
                                "en-US",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </span>
                    </button>

                    <input
                        ref={dateInputRef}
                        type="date"
                        value={selectedDate}
                        onChange={(e) =>
                            setSelectedDate(e.target.value)
                        }
                        className="absolute opacity-0 pointer-events-none"
                    />
                </div>

            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <div className="grid grid-cols-1 md:grid-cols-3">

                    {/* First Check In */}

                    <div className="flex items-center gap-5 md:border-r border-gray-200">

                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">

                            <LogIn className="w-8 h-8 text-green-600" />

                        </div>

                        <div>

                            <p className="text-gray-700 font-semibold">

                                First Check In

                            </p>

                            <h2 className="text-4xl font-bold text-green-600 mt-1">

                                {formatTime(firstCheckIn)}

                            </h2>

                            <p className="text-gray-500 mt-1">

                                {dateLabel}

                            </p>

                        </div>

                    </div>

                    {/* Last Check Out */}

                    <div className="flex items-center gap-5 md:px-8 md:border-r border-gray-200">

                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">

                            <LogOut className="w-8 h-8 text-orange-500" />

                        </div>

                        <div>

                            <p className="text-gray-700 font-semibold">

                                Last Check Out

                            </p>

                            <h2 className="text-4xl font-bold text-orange-500 mt-1">

                                {formatTime(lastCheckOut)}

                            </h2>

                            <p className="text-gray-500 mt-1">

                                {dateLabel}

                            </p>

                        </div>

                    </div>

                    {/* Total Hours */}

                    <div className="flex items-center gap-5 md:px-8">

                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">

                            <Clock3 className="w-8 h-8 text-indigo-600" />

                        </div>

                        <div>

                            <p className="text-gray-700 font-semibold">

                                Total Working Hours

                            </p>

                            <h2 className="text-4xl font-bold text-indigo-600 mt-1">

                                {formatWorkingHours(attendance?.totalWorkingHours)}

                            </h2>

                            <p className="text-gray-500 mt-1">

                                {dateLabel}

                            </p>

                        </div>

                    </div>

                </div>

            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Check In Section */}

                    <div className="p-6 md:p-8">

                        <div className="max-w-sm mx-auto">

                            <h3 className="text-xl font-semibold text-slate-900">
                                Check In
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Start your work by checking in
                            </p>

                            <button
                                onClick={handleCheckIn}
                                disabled={!canCheckIn}
                                className={`
                        mt-6
                        h-12
                        w-full
                        rounded-xl
                        font-semibold
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all

                        ${canCheckIn
                                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }
                    `}
                            >
                                <LogIn size={18} />
                                Check In Now
                            </button>

                            <div className="flex items-start gap-2 mt-5 text-sm text-slate-500">
                                <Info
                                    size={16}
                                    className="mt-0.5 flex-shrink-0"
                                />
                                <span>
                                    {isToday
                                        ? "You can check in multiple times in a day"
                                        : "Check-in is only available for today's date"}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Check Out Section */}

                    <div className="p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-slate-200">

                        <div className="max-w-sm mx-auto">

                            <h3 className="text-xl font-semibold text-slate-900">
                                Check Out
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                End your work session by checking out
                            </p>

                            <button
                                onClick={handleCheckOut}
                                disabled={!canCheckOut}
                                className={`
                        mt-6
                        h-12
                        w-full
                        rounded-xl
                        font-semibold
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all

                        ${canCheckOut
                                        ? "border-2 border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                                    }
                    `}
                            >
                                <LogOut size={18} />
                                Check Out Now
                            </button>

                            <div className="flex items-start gap-2 mt-5 text-sm text-slate-500">
                                <Info
                                    size={16}
                                    className="mt-0.5 flex-shrink-0"
                                />
                                <span>
                                    {isToday
                                        ? "You can check out multiple times in a day"
                                        : "Check-out is only available for today's date"}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
            {/* Today's Check In/Out Activity */}

            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isToday ? "Today's" : dateLabel} Check In/Out Activity
                    </h2>
                </div>

                <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead className="bg-gray-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Session
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Check In
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Check Out
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Working Hours
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {attendanceHistory?.sessions.length ? (

                                attendanceHistory.sessions.map((session) => (

                                    <tr
                                        key={session.id}
                                        className="hover:bg-gray-50 transition"
                                    >

                                        <td className="px-6 py-5 font-semibold text-gray-700">
                                            #{session.sessionNumber}
                                        </td>

                                        <td className="px-6 py-5 text-gray-800">
                                            {formatTime(session.checkInTime)}
                                        </td>

                                        <td className="px-6 py-5 text-gray-800">
                                            {formatTime(session.checkOutTime)}
                                        </td>

                                        <td className="px-6 py-5 font-medium text-gray-800">
                                            {formatWorkingHours(session.workingHours)}
                                        </td>

                                        <td className="px-6 py-5">

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${session.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {session.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="text-center py-10 text-gray-500"
                                    >
                                        No attendance sessions found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                <div className="bg-indigo-50 border-t border-indigo-100">

                    <div className="flex justify-between items-center px-6 py-4">

                        <span className="font-semibold text-gray-700">
                            Total Working Hours
                        </span>

                        <span className="text-xl font-bold text-indigo-700">
                            {formatWorkingHours(attendance?.totalWorkingHours ?? 0)}
                        </span>

                    </div>

                </div>

            </div>
            {/* Weekly Summary */}

            <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        This Week Summary
                    </h2>
                </div>

                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {weeklySummary?.days.map((day) => {
                            const date = new Date(day.date);
                            return (
                                <div
                                    key={day.date}
                                    className="group flex flex-col items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {date.getDate()}
                                        </p>
                                    </div>

                                    <div className="my-6 text-center">
                                        <p className="text-2xl font-black text-indigo-600">
                                            {day.workingHours > 0 ? formatWorkingHours(day.workingHours) : "--"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${day.isPresent ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                        <span className={`text-xs font-semibold ${day.isPresent ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {day.isPresent ? "Present" : "Absent"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;