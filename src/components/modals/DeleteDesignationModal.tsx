import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteDesignationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    designationName: string;
}

const DeleteDesignationModal: React.FC<DeleteDesignationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    designationName 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Warning Header */}
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <AlertTriangle size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Remove Designation</h3>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to remove <span className="font-semibold text-gray-900">{designationName}</span> from the system?
                    </p>
                    <p className="text-xs text-gray-400">
                        This action will permanently delete this designation's data and cannot be undone.
                    </p>
                </div>

                {/* Styled Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                    >
                        Delete Designation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDesignationModal;