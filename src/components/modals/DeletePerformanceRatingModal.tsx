import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Loader from "../common/Loader";

interface DeletePerformanceRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    ratingName: string;
    loading?: boolean;
}

const DeletePerformanceRatingModal: React.FC<DeletePerformanceRatingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    ratingName,
    loading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">

                {/* Warning Header */}
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <AlertTriangle size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Remove Performance Rating</h3>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                        Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-slate-100">{ratingName}</span> from the system?
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        This rating will be deactivated and hidden from the active list. It will not be permanently deleted.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 min-w-[110px] flex items-center justify-center"
                    >
                        {loading ? <Loader size="sm" /> : "Delete Rating"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePerformanceRatingModal;
