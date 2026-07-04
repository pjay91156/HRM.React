import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import { getPendingRegularizationRequests } from "../services/regularizeAttendanceService";
import type { ManagerPendingRegularizationResponse } from "../models/RegularizeAttendance";

const TeamLeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<ManagerPendingRegularizationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const response = await getPendingRegularizationRequests();
      setRequests(response);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter((x) => {
    const employee =
      x.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      x.employeeCode.toLowerCase().includes(search.toLowerCase());

    const statusMatch = status === "" || x.status === status;

    return employee && statusMatch;
  });

  return (
    <div className="p-6">
      {/* Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <input
            className="pl-10 pr-3 py-2 border rounded-lg"
            placeholder="Search Employee"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No regularization requests found.
        </div>
      ) : (
       <div className="bg-white rounded-xl shadow border overflow-hidden">
    {/* Header */}
    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b text-sm font-semibold text-gray-600">
        <div className="col-span-3">Employee</div>
        <div className="col-span-2">Attendance Date</div>
        <div className="col-span-2">Requested On</div>
        <div className="col-span-2">Changes</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-center">Actions</div>
    </div>

    {filtered.map((item) => (
        <div
            key={item.attendanceId}
            className="border-b last:border-b-0 hover:bg-gray-50 transition"
        >
            <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center">

                {/* Employee */}
                <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                    </div>

                    <div>
                        <div className="font-semibold">
                            {item.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                            {item.employeeCode}
                        </div>
                    </div>
                </div>

                {/* Attendance Date */}
                <div className="col-span-2">
                    {new Date(item.attendanceDate).toLocaleDateString()}
                </div>

                {/* Requested On */}
                <div className="col-span-2">
                    {new Date(item.requestedOn).toLocaleString()}
                </div>

                {/* Changes */}
                <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                        {item.changeTypes.split(", ").map(change => (
                            <span
                                key={change}
                                className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700"
                            >
                                {change}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                        {item.status}
                    </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-2">

                    <button className="p-2 rounded-lg border hover:bg-gray-100">
                        <Eye size={18} />
                    </button>

                    <button className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                        <CheckCircle size={18} />
                    </button>

                    <button className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
                        <XCircle size={18} />
                    </button>

                </div>

            </div>

            {/* Reason */}
            <div className="px-6 pb-5 text-sm">
                <span className="font-medium text-gray-600">
                    Reason:
                </span>{" "}
                {item.reason}
            </div>

        </div>
    ))}
</div>
      )}
    </div>
  );
};

export default TeamLeaveRequests;