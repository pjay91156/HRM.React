import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteLeaveTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    leaveTypeName: string;
}

const DeleteLeaveTypeModal: React.FC<DeleteLeaveTypeModalProps> = ({ isOpen, onClose, onConfirm, leaveTypeName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 text-red-600 mb-4"><AlertTriangle size={22} /><h3 className="text-lg font-bold">Remove Leave Type</h3></div>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to remove <span className="font-semibold">{leaveTypeName}</span>?</p>
                <div className="flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-xl">Delete</button></div>
            </div>
        </div>
    );
};
export default DeleteLeaveTypeModal;