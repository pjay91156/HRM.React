import React, { useEffect, useMemo, useState } from "react";
import leaveRequestService from "../services/leaveRequestService";
import { Check, X, Search } from "lucide-react";
import { type TeamLeaveRequest } from "../models/LeaveRequest";
import Loader from "../components/common/Loader";
import LeaveApprovalModal from "../components/modals/LeaveApprovalModal";

const statusConfig: Record<string, { color: string; bg: string }> = {
    Pending: { color: "text-amber-600", bg: "bg-amber-50" },
    Approved: { color: "text-emerald-600", bg: "bg-emerald-50" },
    Rejected: { color: "text-red-600", bg: "bg-red-50" },
    Cancelled: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-950" },
};

const TeamLeaveRequests: React.FC = () => {
    const [requests, setRequests] = useState<TeamLeaveRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("Pending");
    const [searchTerm, setSearchTerm] = useState("");

    const [actionType, setActionType] =
        useState<"approve" | "reject">("approve");

    const [selectedRequest,
        setSelectedRequest] =
        useState<TeamLeaveRequest | null>(null);

    const [comments, setComments] =
        useState("");

    const [actionLoading,
        setActionLoading] =
        useState(false);

    useEffect(() => {
        fetchTeamLeaves();
    }, []);

    const fetchTeamLeaves = async () => {
        try {
            setLoading(true);

            const response = await leaveRequestService.getTeamLeaves();

            if (response.success) {
                setRequests(response.data ?? []);
            }
        } catch (error) {
            console.error("Error fetching team leaves:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleApproveClick = (
        request: TeamLeaveRequest
    ) => {

        setSelectedRequest(request);
        setActionType("approve");
        setComments("");
        setModalOpen(true);
    };

    const handleRejectClick = (
        request: TeamLeaveRequest
    ) => {

        setSelectedRequest(request);
        setActionType("reject");
        setComments("");
        setModalOpen(true);
    };
    const filteredRequests = useMemo(() => {
        return requests
            .filter((req) => selectedStatus === "All" || req.status === selectedStatus)
            .filter((req) =>
                searchTerm.trim() === "" ||
                req.employeeName.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
    }, [requests, selectedStatus, searchTerm]);

    const handleConfirmAction = async () => {

        if (!selectedRequest) return;

        try {

            setActionLoading(true);

            const response =
                await leaveRequestService.approveRejectLeave({
                    leaveRequestId:
                        selectedRequest.leaveRequestId,

                    status:
                        actionType === "approve"
                            ? 2
                            : 3,

                    comments
                });

            if (response.success) {

                setModalOpen(false);

                await fetchTeamLeaves();
            }
        }
        catch (error) {

            console.error(
                "Error approving/rejecting leave:",
                error
            );
        }
        finally {

            setActionLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Team Leave Requests
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Review and take action on your team's leave requests
                </p>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search
                            className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="All">All</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Employee
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Leave Type
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    From
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    To
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Days
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Reason
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Applied On
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Status
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="p-8 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr
                                        key={req.leaveRequestId}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        <td className="p-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {req.employeeName}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {req.leaveType}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(req.fromDate).toLocaleDateString()}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(req.toDate).toLocaleDateString()}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {req.totalDays}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {req.reason}
                                        </td>

                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(req.appliedOn).toLocaleDateString()}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${statusConfig[req.status]?.bg ?? "bg-slate-50 dark:bg-slate-950"} ${statusConfig[req.status]?.color ?? "text-slate-600 dark:text-slate-400"}`}>
                                                {req.status}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            {req.status === "Pending" && (
                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleApproveClick(req)
                                                        }
                                                        className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                    >
                                                        <Check size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleRejectClick(req)
                                                        }
                                                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <LeaveApprovalModal
                isOpen={modalOpen}
                action={actionType}
                employeeName={
                    selectedRequest?.employeeName ?? ""
                }
                comments={comments}
                loading={actionLoading}
                onCommentsChange={setComments}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
};

export default TeamLeaveRequests;