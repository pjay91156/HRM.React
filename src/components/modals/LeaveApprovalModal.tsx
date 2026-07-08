import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import Loader from "../common/Loader";

interface LeaveApprovalModalProps {
    isOpen: boolean;
    action: "approve" | "reject";
    employeeName: string;
    comments: string;
    loading: boolean;
    onCommentsChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
    isOpen,
    action,
    employeeName,
    comments,
    loading,
    onCommentsChange,
    onClose,
    onConfirm
}) => {

    if (!isOpen) return null;

    const isApprove = action === "approve";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-xl">

                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b">

                    <div
                        className={`p-2 rounded-lg ${
                            isApprove
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        }`}
                    >
                        {isApprove ? (
                            <CheckCircle size={22} />
                        ) : (
                            <XCircle size={22} />
                        )}
                    </div>

                    <h2 className="text-lg font-bold">
                        {isApprove ? "Approve Leave" : "Reject Leave"}
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6">

                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                        Are you sure you want to{" "}
                        <span className="font-semibold">
                            {isApprove ? "approve" : "reject"}
                        </span>{" "}
                        leave request for{" "}
                        <span className="font-semibold">
                            {employeeName}
                        </span>
                        ?
                    </p>

                    <textarea
                        rows={4}
                        value={comments}
                        onChange={(e) =>
                            onCommentsChange(e.target.value)
                        }
                        placeholder={
                            isApprove
                                ? "Optional comments"
                                : "Reason for rejection"
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-6 border-t">

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={`w-full sm:w-auto rounded-lg px-5 py-2.5 text-sm font-medium text-white ${
                            isApprove
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {loading ? (
                            <Loader size="sm" />
                        ) : isApprove ? (
                            "Approve Leave"
                        ) : (
                            "Reject Leave"
                        )}
                    </button>
                </div>

            </div>
            
        </div>
    );
};

export default LeaveApprovalModal;