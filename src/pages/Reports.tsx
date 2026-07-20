import React, { useEffect, useState } from "react";
import {
    Users,
    Clock,
    CalendarRange,
    TrendingUp,
    Download,
    FileSpreadsheet
} from "lucide-react";
import reportService from "../services/reportService";
import performanceCycleService from "../services/performanceCycleService";
import { toast } from "react-toastify";

interface PerformanceCycleOption {
    id: string;
    cycleName: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthStartIso = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
};

const ReportCard: React.FC<{
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    children?: React.ReactNode;
    onDownload: () => Promise<void>;
}> = ({ icon, iconBg, title, description, children, onDownload }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await onDownload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to download report.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
            <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>{icon}</div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                </div>
            </div>

            {children && <div className="mt-5 space-y-3">{children}</div>}

            <button
                onClick={handleDownload}
                disabled={downloading}
                className="mt-5 inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
                <Download size={16} />
                {downloading ? "Preparing CSV..." : "Download CSV"}
            </button>
        </div>
    );
};

const inputClass = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-300";

const Reports: React.FC = () => {
    const [attendanceFrom, setAttendanceFrom] = useState(monthStartIso());
    const [attendanceTo, setAttendanceTo] = useState(todayIso());

    const [leaveFrom, setLeaveFrom] = useState("");
    const [leaveTo, setLeaveTo] = useState("");
    const [leaveStatus, setLeaveStatus] = useState("");

    const [cycles, setCycles] = useState<PerformanceCycleOption[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState("");

    useEffect(() => {
        loadCycles();
    }, []);

    const loadCycles = async () => {
        try {
            const response = await performanceCycleService.getPerformanceCycles();
            if (response.success) {
                setCycles(response.data ?? []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Reports</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate and download CSV reports for your organization and team.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <ReportCard
                    icon={<Users size={22} className="text-indigo-600" />}
                    iconBg="bg-indigo-50 dark:bg-indigo-500/10"
                    title="Employee Directory"
                    description="All employees in your company with department, designation, contact and manager details."
                    onDownload={() => reportService.downloadEmployeeDirectoryReport()}
                />

                <ReportCard
                    icon={<Clock size={22} className="text-emerald-600" />}
                    iconBg="bg-emerald-50 dark:bg-emerald-500/10"
                    title="Attendance Report"
                    description="Daily attendance status for you and your reporting hierarchy over a date range."
                    onDownload={() => reportService.downloadAttendanceReport(attendanceFrom, attendanceTo)}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">From</label>
                            <input type="date" value={attendanceFrom} onChange={(e) => setAttendanceFrom(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">To</label>
                            <input type="date" value={attendanceTo} onChange={(e) => setAttendanceTo(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </ReportCard>

                <ReportCard
                    icon={<CalendarRange size={22} className="text-orange-600" />}
                    iconBg="bg-orange-50 dark:bg-orange-500/10"
                    title="Leave Report"
                    description="Leave requests for you and your direct reports, optionally filtered by date range and status."
                    onDownload={() => reportService.downloadLeaveReport(leaveFrom || undefined, leaveTo || undefined, leaveStatus || undefined)}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">From (optional)</label>
                            <input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">To (optional)</label>
                            <input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status (optional)</label>
                        <select value={leaveStatus} onChange={(e) => setLeaveStatus(e.target.value)} className={inputClass}>
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </ReportCard>

                <ReportCard
                    icon={<TrendingUp size={22} className="text-purple-600" />}
                    iconBg="bg-purple-50 dark:bg-purple-500/10"
                    title="Performance Review Report"
                    description="Self and manager scores for you and your direct reports, optionally filtered by cycle."
                    onDownload={() => reportService.downloadPerformanceReviewReport(selectedCycleId || undefined)}
                >
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cycle (optional)</label>
                        <select value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)} className={inputClass}>
                            <option value="">All Cycles</option>
                            {cycles.map((cycle) => (
                                <option key={cycle.id} value={cycle.id}>{cycle.cycleName}</option>
                            ))}
                        </select>
                    </div>
                </ReportCard>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <FileSpreadsheet size={14} />
                Reports are scoped to your own record and the employees reporting to you.
            </div>
        </div>
    );
};

export default Reports;
