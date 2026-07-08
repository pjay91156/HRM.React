import React, { useEffect, useMemo, useState } from "react";
import leaveRequestService from "../services/leaveRequestService";

interface TeamLeaveCalendarResponse {
  leaveRequestId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
}

const TeamLeaveCalendar: React.FC = () => {
  const [leaves, setLeaves] = useState<TeamLeaveCalendarResponse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");

  useEffect(() => { loadCalendar(); }, []);

  const loadCalendar = async () => {
    const response = await leaveRequestService.getTeamLeaveCalendar();
    if (response.success) setLeaves(response.data || []);
  };

  const { year, month, days, firstDay } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return { 
        year: y, 
        month: m, 
        days: new Date(y, m + 1, 0).getDate(), 
        firstDay: new Date(y, m, 1).getDay() 
    };
  }, [currentDate]);

  const calendarCells = useMemo(() => {
    const arr: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= days; i++) arr.push(new Date(year, month, i));
    return arr;
  }, [year, month, days, firstDay]);

  const leaveCounts = useMemo(() => ({
    sick: leaves.filter(l => l.leaveType === "Sick Leave").length,
    casual: leaves.filter(l => l.leaveType === "Casual Leave").length,
    earned: leaves.filter(l => l.leaveType === "Earned Leave").length,
  }), [leaves]);

  const getLeaveTheme = (type: string) => {
    switch (type) {
      case "Sick Leave": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Casual Leave": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Earned Leave": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
    }
  };

  const SelectInput = ({ children, value, onChange }: any) => (
    <div className="relative">
      <select 
        className="appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-4 py-2 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        value={value} onChange={onChange}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Leave Calendar</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          >
            Today
          </button>
          <SelectInput value={month} onChange={(e: any) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}>
            {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
          </SelectInput>
          <SelectInput value={year} onChange={(e: any) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </SelectInput>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarCells.map((date, i) => {
            const isToday = date?.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`h-[80px] border-r border-b border-gray-100 dark:border-slate-800 p-1.5 transition-colors ${isToday ? 'bg-blue-50/50' : 'bg-white dark:bg-slate-900'}`}>
                {date && (
                  <>
                    <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 overflow-y-auto max-h-[50px] [&::-webkit-scrollbar]:hidden">
                      {leaves
                        .filter(l => (leaveTypeFilter === "All" || l.leaveType === leaveTypeFilter) && date >= new Date(l.fromDate) && date <= new Date(l.toDate))
                        .map(l => (
                          <div key={l.leaveRequestId} className={`px-1.5 py-0.5 text-[9px] font-medium rounded border truncate ${getLeaveTheme(l.leaveType)}`}>
                            {l.employeeName}
                          </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex gap-6 mt-6 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-sm">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Sick Leave</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Casual Leave</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Earned Leave</div>
      </div>
    </div>
  );
};

export default TeamLeaveCalendar;