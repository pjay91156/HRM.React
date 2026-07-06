import React, { useEffect, useRef, useState } from 'react';
import { Users, CheckCircle, XCircle, CalendarDays, RefreshCw, Download, Search } from 'lucide-react';
import { getAttendanceSummaryByDate, getTeamAttendance } from '../services/attendanceService';
import { type TeamAttendanceSummaryResponse, type TeamAttendanceFilter, type TeamAttendanceItem } from '../models/Attendance';
import Loader from '../components/common/Loader';

export const TeamAttendance = () => {
  const [summary, setSummary] = useState<TeamAttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<TeamAttendanceItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState<TeamAttendanceFilter>({
    managerId: null,
    searchText: "",
    attendanceDate: new Date().toISOString().split("T")[0],
    pageNumber: 1,
    pageLength: 10
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, tableData] = await Promise.all([
        getAttendanceSummaryByDate(filter.attendanceDate),
        getTeamAttendance(filter)
      ]);
      setSummary(summaryData);
      setEmployees(tableData.records);
      setTotalRecords(tableData.totalRecords);
    } catch (error) {
      console.error("Failed to load attendance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, searchText: e.target.value, pageNumber: 1 }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, attendanceDate: e.target.value, pageNumber: 1 }));
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.focus();
    }
  };

  const changePage = (page: number) => {
    setFilter(prev => ({ ...prev, pageNumber: page }));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Team Attendance</h1>
          <p className="text-sm text-gray-500">View and manage attendance records for your team.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={openDatePicker}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            >
              <CalendarDays size={16} className="text-blue-600" />
              {new Date(filter.attendanceDate).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={filter.attendanceDate}
              onChange={handleDateChange}
              className="absolute opacity-0 pointer-events-none"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Employees', count: summary?.totalEmployees ?? 0, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
          { title: 'Present', count: summary?.presentEmployees ?? 0, icon: <CheckCircle size={20} />, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Absent', count: summary?.absentEmployees ?? 0, icon: <XCircle size={20} />, color: 'text-rose-600 bg-rose-50' },
          { title: 'On Leave', count: summary?.onLeaveEmployees ?? 0, icon: <CalendarDays size={20} />, color: 'text-amber-600 bg-amber-50' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.count}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-2 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={filter.searchText}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Reporting To</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Working Hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-16"><Loader /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map(employee => (
                  <tr key={employee.employeeId} className="hover:bg-gray-50/80 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{employee.employeeName}</span>
                        <span className="text-xs text-gray-400">{employee.employeeCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.reportingManager || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {employee.firstCheckIn ? new Date(employee.firstCheckIn).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {employee.lastCheckOut ? new Date(employee.lastCheckOut).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                      {employee.totalWorkingHours.toFixed(2)}h
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        employee.status === "Present" ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" :
                        employee.status === "Absent" ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20" :
                        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{Math.min((filter.pageNumber - 1) * filter.pageLength + 1, totalRecords || 1)}</span> to <span className="font-medium">{Math.min(filter.pageNumber * filter.pageLength, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span>
          </div>
          <div className="flex gap-2">
            <button disabled={filter.pageNumber === 1} onClick={() => changePage(filter.pageNumber - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all">Previous</button>
            <button disabled={filter.pageNumber * filter.pageLength >= totalRecords} onClick={() => changePage(filter.pageNumber + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendance;