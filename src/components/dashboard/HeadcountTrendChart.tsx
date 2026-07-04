import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { type HeadcountChart } from "../../models/Dashboard";


interface ChartProps {
    growthRate: number;
    chartData: HeadcountChart[];
}
const HeadcountTrendChart: React.FC<ChartProps> = ({ growthRate, chartData }) => {
    return (
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Headcount Trend</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Employee growth over the last 6 months</p>
                </div>
                <div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                        <ArrowUpRight size={14} />
                        +{growthRate || '24.7'}% this year
                    </span>
                </div>
            </div>

            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="headcountGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                        />
                        <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                        <Area type="monotone" dataKey="headcount" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#headcountGradient)" activeDot={{ r: 6 }} dot={{ r: 4 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HeadcountTrendChart;