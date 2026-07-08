import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  User,
  CheckCircle,
  XCircle,
  Eye,
  CalendarDays,
  Sparkles,
  Filter,
} from "lucide-react";

import {
  getPendingRegularizationRequests,
  approveRejectRegularizationRequest,
  getRegularizationDetails,
} from "../services/regularizeAttendanceService";
import type { ManagerPendingRegularizationResponse, RegularizationDetailsResponse } from "../models/RegularizeAttendance";
import Loader from "../components/common/Loader";

const TeamLeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<ManagerPendingRegularizationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Pending");
  const [selectedRequest, setSelectedRequest] = useState<ManagerPendingRegularizationResponse | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [comments, setComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<RegularizationDetailsResponse | null>(null);
  const [detailsRequest, setDetailsRequest] = useState<ManagerPendingRegularizationResponse | null>(null);
  const [panelComment, setPanelComment] = useState("");
  const [panelActionLoading, setPanelActionLoading] = useState(false);
  const [panelActionError, setPanelActionError] = useState<string | null>(null);

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

  const handleApproveClick = (request: ManagerPendingRegularizationResponse) => {
    setSelectedRequest(request);
    setActionType("approve");
    setComments("");
    setActionError(null);
    setModalOpen(true);
  };

  const handleRejectClick = (request: ManagerPendingRegularizationResponse) => {
    setSelectedRequest(request);
    setActionType("reject");
    setComments("");
    setActionError(null);
    setModalOpen(true);
  };

  const handleViewDetails = async (request: ManagerPendingRegularizationResponse) => {
    setDetailsRequest(request);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsData(null);
    setPanelComment("");
    setPanelActionError(null);

    try {
      const response = await getRegularizationDetails(request.attendanceId, request.employeeId);
      if (!response) {
        throw new Error("No regularization details were returned.");
      }

      setDetailsData(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load request details.";
      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsPanel = () => {
    setDetailsOpen(false);
    setDetailsData(null);
    setDetailsError(null);
    setDetailsRequest(null);
    setPanelComment("");
    setPanelActionError(null);
  };

  const handlePanelAction = async (action: "approve" | "reject") => {
    if (!detailsRequest) return;

    try {
      setPanelActionLoading(true);
      setPanelActionError(null);

      const response = await approveRejectRegularizationRequest({
        attendanceId: detailsRequest.attendanceId,
        employeeId: detailsRequest.employeeId,
        status: action === "approve" ? 2 : 3,
        comments: panelComment,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update this request.");
      }

      await loadData();
      closeDetailsPanel();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete this action.";
      setPanelActionError(message);
    } finally {
      setPanelActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      setActionError(null);

      const response = await approveRejectRegularizationRequest({
        attendanceId: selectedRequest.attendanceId,
        employeeId: selectedRequest.employeeId,
        status: actionType === "approve" ? 2 : 3,
        comments,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update this request.");
      }

      await loadData();
      setModalOpen(false);
      setSelectedRequest(null);
      setComments("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete this action.";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((x) => {
      const employee =
        x.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        x.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        x.reason.toLowerCase().includes(search.toLowerCase());

      const statusMatch = status === "" || x.status === status;
      return employee && statusMatch;
    });
  }, [requests, search, status]);

  const summary = useMemo(() => ({
    pending: requests.filter((x) => x.status === "Pending").length,
    approved: requests.filter((x) => x.status === "Approved").length,
    rejected: requests.filter((x) => x.status === "Rejected").length,
  }), [requests]);

  const getStatusBadge = (statusValue: string) => {
    const normalized = statusValue.toLowerCase();
    if (normalized === "approved") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (normalized === "rejected") {
      return "bg-rose-50 text-rose-700 border border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getActionBadge = (changeType: string) => {
    switch (changeType.toLowerCase()) {
      case "add":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "delete":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Sparkles size={16} />
              Attendance Regularization Requests
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Review and act on team regularization requests</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track attendance changes, review employee reasons, and approve or reject requests in one place.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2"><CalendarDays size={16} className="text-indigo-500" /> Today’s review queue</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{summary.pending} pending approvals</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="text-sm font-medium text-amber-700">Pending</div>
            <div className="mt-2 text-2xl font-semibold text-amber-900">{summary.pending}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="text-sm font-medium text-emerald-700">Approved</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-900">{summary.approved}</div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="text-sm font-medium text-rose-700">Rejected</div>
            <div className="mt-2 text-2xl font-semibold text-rose-900">{summary.rejected}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Regularization queue</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review employee attendance adjustments and take action quickly.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  placeholder="Search employee or reason"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                <Filter size={16} className="text-slate-400 dark:text-slate-500" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-transparent outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="">All</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center"><Loader /></div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 m-4 text-sm text-slate-500 dark:text-slate-400">
              No regularization requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Date</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Requested On</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Changes</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reason</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filtered.map((item) => (
                    <tr key={item.attendanceId} className="hover:bg-slate-50/80">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{item.employeeName}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{item.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(item.attendanceDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(item.requestedOn).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.changeTypes.split(", ").map((change) => (
                            <span key={change} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                              {change}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="line-clamp-2">{item.reason}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleViewDetails(item)} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100" title="View details">
                            <Eye size={16} />
                          </button>
                          {item.status.toLowerCase() === "pending" && (
                            <>
                              <button onClick={() => handleApproveClick(item)} className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700" title="Approve">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleRejectClick(item)} className="rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-700" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detailsOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-2xl flex-col bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
                  {getInitials(detailsData?.employeeName || "Employee")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{detailsData?.employeeName || "Regularization details"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{detailsData?.departmentName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Employee ID: {detailsData?.employeeCode}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                {detailsData && (
                  <div className="text-right text-sm">
                    <div className="text-slate-500 dark:text-slate-400">Attendance Date</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(detailsData.attendanceDate).toLocaleDateString()}</div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400">Submitted On</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(detailsData.requestedOn).toLocaleString()}</div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={closeDetailsPanel}
                  className="rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {detailsLoading ? (
                <div className="flex justify-center py-8"><Loader size="md" /></div>
              ) : detailsError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{detailsError}</div>
              ) : detailsData ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 dark:bg-indigo-500/10 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Reason</div>
                    <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{detailsData.reason}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">Current Working Time</div>
                      <div className="mt-1 text-xl font-bold text-rose-800">{detailsData.currentWorkingTime}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">After Approval (Proposed)</div>
                      <div className="mt-1 text-xl font-bold text-emerald-800">{detailsData.proposedWorkingTime}</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Existing Sessions (Current)</div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Session</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Check In</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Check Out</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Working Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {detailsData.existingSessions.map((session) => (
                            <tr key={session.sessionNumber}>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{session.sessionNumber}</td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{session.checkIn}</td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{session.checkOut}</td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{session.workingTime}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Requested Changes</div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(detailsData.status)}`}>
                        {detailsData.status}
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Action</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Session</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested</th>
                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {detailsData.changes.map((change, index) => (
                            <tr key={`${change.changeType}-${index}`}>
                              <td className="px-4 py-2">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getActionBadge(change.changeType)}`}>
                                  {change.changeType}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                                {change.sessionNumber}
                                {change.isNewSession ? " (New)" : ""}
                              </td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{change.current}</td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{change.requested}</td>
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{change.changeDescription}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {detailsData.status === "Pending" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Manager Comment</label>
                      <textarea
                        rows={3}
                        value={panelComment}
                        onChange={(e) => setPanelComment(e.target.value)}
                        placeholder="Enter your comment..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                      {panelActionError && (
                        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                          {panelActionError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {detailsData?.status === "Pending" && (
              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                <button
                  type="button"
                  disabled={panelActionLoading}
                  onClick={() => handlePanelAction("reject")}
                  className="rounded-xl border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={panelActionLoading}
                  onClick={() => handlePanelAction("approve")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {panelActionLoading && <Loader size="sm" />}
                  {panelActionLoading ? "Processing..." : "Approve"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-6 py-5">
              <div className={`rounded-xl p-2 ${actionType === "approve" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {actionType === "approve" ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{actionType === "approve" ? "Approve" : "Reject"} Regularization</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedRequest.employeeName}</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Decide whether to allow this attendance adjustment request and leave an optional note for the employee.
              </p>
              {actionError && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {actionError}
                </div>
              )}
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={actionType === "approve" ? "Optional comments" : "Reason for rejection"}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 sm:flex-row">
              <button type="button" onClick={() => {
                setModalOpen(false);
                setSelectedRequest(null);
                setComments("");
                setActionError(null);
              }} className="rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmAction} disabled={actionLoading} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
                {actionLoading && <Loader size="sm" />}
                {actionLoading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaveRequests;