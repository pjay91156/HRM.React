import React, { useEffect, useState } from "react";
import leaveRequestService from "../services/leaveRequestService";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: number; 
  appliedOn: string;
}

// Status starts from 1 as requested
const statusConfig = [
  { label: "Pending", status: 1, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-600" },
  { label: "Approved", status: 2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-600" },
  { label: "Rejected", status: 3, color: "text-red-600", bg: "bg-red-50", border: "border-red-600" },
  { label: "Cancelled", status: 4, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-950", border: "border-slate-600" },
];

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const response = await leaveRequestService.getMyLeaves();
      if (response.success) setLeaves(response.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = selectedStatus === null 
    ? leaves 
    : leaves.filter((l) => l.status === selectedStatus);

  return (
    <div className="p-8 max-w-[1400px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Leaves</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your leave requests</p>
        </div>
        <button onClick={() => navigate("/leave-request")} className="bg-[#6C63FF] hover:bg-[#5B52F5] text-white px-6 py-2 rounded-lg font-medium">
          Apply Leave
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div 
          onClick={() => setSelectedStatus(null)}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedStatus === null ? "border-indigo-600 bg-white dark:bg-slate-900 shadow-md" : "border-transparent bg-indigo-50 dark:bg-indigo-500/10"}`}
        >
          <p className="text-sm text-indigo-600 font-medium">Total Requests</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{leaves.length}</p>
        </div>

        {statusConfig.map((item) => {
          const isSelected = selectedStatus === item.status;
          return (
            <div 
              key={item.status}
              onClick={() => setSelectedStatus(item.status)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${isSelected ? `border-2 ${item.border} bg-white dark:bg-slate-900 shadow-md` : `border-transparent ${item.bg}`}`}
            >
              <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                {leaves.filter(l => l.status === item.status).length}
              </p>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Leave Type</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">From</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">To</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Days</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <Loader />
                </td>
              </tr>
            ) : filteredLeaves.map((leave) => {
              const config = statusConfig.find(c => c.status === leave.status);
              return (
                <tr key={leave.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-4 text-sm font-medium">{leave.leaveType}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{leave.totalDays}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${config?.bg} ${config?.color}`}>
                      {config?.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <Eye size={18} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-indigo-600" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyLeaves;