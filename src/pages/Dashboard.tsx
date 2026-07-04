import React, { useEffect, useState } from "react";
import {
    Users,
    Building2,
    ShieldAlert,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";

import Loader from "../components/common/Loader"
import { getDashboard, getHeadcountTrend } from "../services/dashboardService";
import { type DashboardResponse, type HeadcountChart } from "../models/Dashboard";
import HeadcountTrendChart from "../components/dashboard/HeadcountTrendChart";
import DepartmentChart from "../components/dashboard/departmentChart";

const Dashboard: React.FC = () => {

    const [loading, setLoading] = useState(true);

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);
    const [headcountTrend, setHeadcountTrend] =
        useState<HeadcountChart[]>([]);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [dashboardResponse, trendResponse] = await Promise.all([
                    getDashboard(),
                    getHeadcountTrend()
                ]);

                setDashboard(dashboardResponse);
                setHeadcountTrend(trendResponse);

            }
            catch (error) {

                console.log(error);

            }
            finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);

    const now = new Date();

    const currentDate = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const hour = now.getHours();

    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 17
                ? "Good afternoon"
                : "Good evening";

    const stats = {

        totalEmployees: dashboard?.totalEmployees ?? 0,

        departments: dashboard?.totalDepartments ?? 0,

        designations: dashboard?.totalDesignations ?? 0,

        growthRate: dashboard?.growthRate ?? 0

    };

    return (

        <div className="relative w-full min-h-screen bg-slate-50 p-6 font-sans">
            {/* ✅ FIXED: Switched absolute to fixed to center the loader over the entire browser viewport */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                    <Loader />
                </div>
            )}

            {/* --- WELCOME BANNER --- */}
            <div className="relative w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 overflow-hidden">

                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                    <p className="text-xs font-medium text-indigo-100 opacity-90 mb-1">
                        {currentDate}
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {greeting}, Admin
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    {/* Total Employees */}

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs min-w-[110px]">

                        <div className="p-1 bg-white/10 rounded-lg">
                            <Users size={14} />
                        </div>

                        <div>
                            <p className="text-[10px] text-indigo-200 block">
                                Employees
                            </p>

                            <p className="font-bold text-sm">
                                {stats.totalEmployees}
                            </p>
                        </div>

                    </div>

                    {/* Departments */}

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs min-w-[110px]">

                        <div className="p-1 bg-white/10 rounded-lg">
                            <Building2 size={14} />
                        </div>

                        <div>
                            <p className="text-[10px] text-indigo-200 block">
                                Departments
                            </p>

                            <p className="font-bold text-sm">
                                {stats.departments}
                            </p>
                        </div>

                    </div>

                    {/* Designations */}

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs min-w-[110px]">

                        <div className="p-1 bg-white/10 rounded-lg">
                            <ShieldAlert size={14} />
                        </div>

                        <div>
                            <p className="text-[10px] text-indigo-200 block">
                                Designations
                            </p>

                            <p className="font-bold text-sm">
                                {stats.designations}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* --- MAIN METRIC GRID --- */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Employees Card */}

                <div className="relative overflow-hidden rounded-2xl bg-[#7B57F2] p-6 text-white shadow-sm transition-transform duration-200 hover:scale-[1.01]">

                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />

                    <div className="mb-4 inline-flex p-3 bg-white/15 rounded-xl">
                        <Users size={22} />
                    </div>

                    <p className="text-xs font-medium text-white/80">
                        Total Employees
                    </p>

                    <p className="text-4xl font-bold my-1">
                        {stats.totalEmployees}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-white/90 mt-2">
                        <ArrowUpRight size={14} />
                        <span>Total Active Employees</span>
                    </div>

                </div>

                {/* Departments Card */}

                <div className="relative overflow-hidden rounded-2xl bg-[#00A1DE] p-6 text-white shadow-sm transition-transform duration-200 hover:scale-[1.01]">

                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />

                    <div className="mb-4 inline-flex p-3 bg-white/15 rounded-xl">
                        <Building2 size={22} />
                    </div>

                    <p className="text-xs font-medium text-white/80">
                        Departments
                    </p>

                    <p className="text-4xl font-bold my-1">
                        {stats.departments}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-white/90 mt-2">
                        <ArrowUpRight size={14} />
                        <span>Active Departments</span>
                    </div>

                </div>

                {/* Designations Card */}

                <div className="relative overflow-hidden rounded-2xl bg-[#00A878] p-6 text-white shadow-sm transition-transform duration-200 hover:scale-[1.01]">

                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />

                    <div className="mb-4 inline-flex p-3 bg-white/15 rounded-xl">
                        <ShieldAlert size={22} />
                    </div>

                    <p className="text-xs font-medium text-white/80">
                        Designations
                    </p>

                    <p className="text-4xl font-bold my-1">
                        {stats.designations}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-white/90 mt-2">
                        <ArrowUpRight size={14} />
                        <span>Active Designations</span>
                    </div>

                </div>

                {/* Growth Rate Card */}

                <div className="relative overflow-hidden rounded-2xl bg-[#FF8000] p-6 text-white shadow-sm transition-transform duration-200 hover:scale-[1.01]">

                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />

                    <div className="mb-4 inline-flex p-3 bg-white/15 rounded-xl">
                        <TrendingUp size={22} />
                    </div>

                    <p className="text-xs font-medium text-white/80">
                        Growth Rate
                    </p>

                    <p className="text-4xl font-bold my-1">
                        {stats.growthRate}%
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-white/90 mt-2">
                        <ArrowUpRight size={14} />
                        <span>YoY Headcount Growth</span>
                    </div>

                </div>

            </div>
            
            <HeadcountTrendChart
                growthRate={stats.growthRate}
                chartData={headcountTrend}
            />
            <DepartmentChart/>

        </div>

    );

};

export default Dashboard;