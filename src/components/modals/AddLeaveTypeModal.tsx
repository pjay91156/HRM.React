import React, { useState } from 'react';
import Loader from "../common/Loader";
import { type LeaveTypeFormData } from '../../models/LeaveType';

interface AddLeaveTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLeaveType: (data: LeaveTypeFormData) => Promise<void>;
    loading: boolean;
}

const AddLeaveTypeModal: React.FC<AddLeaveTypeModalProps> = ({ isOpen, onClose, onAddLeaveType, loading }) => {
    const [formData, setFormData] = useState<LeaveTypeFormData>({
        leaveName: '',
        leaveCode: '',
        description: '',
        defaultDays: '',
        status: 'Active'
    });

    const [errors, setErrors] = useState({
        leaveName: "",
        leaveCode: "",
        defaultDays: ""
    });

    const validateForm = () => {
        const newErrors = { leaveName: "", leaveCode: "", defaultDays: "" };
        let isValid = true;

        if (!formData.leaveName.trim()) {
            newErrors.leaveName = "Leave name is required";
            isValid = false;
        }
        if (!formData.leaveCode.trim()) {
            newErrors.leaveCode = "Leave code is required";
            isValid = false;
        }
        // Convert to number for logical comparison
        const days = typeof formData.defaultDays === 'string'
            ? parseInt(formData.defaultDays)
            : formData.defaultDays;

        if (isNaN(days) || days < 0) {
            newErrors.defaultDays = "Valid default days are required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when typing
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        await onAddLeaveType(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Leave Type</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {/* Leave Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Leave Name <span className="text-red-500">*</span></label>
                            <input
                                name="leaveName"
                                value={formData.leaveName}
                                onChange={handleChange}
                                placeholder="e.g. Sick Leave"
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.leaveName ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                            />
                            {errors.leaveName && <p className="text-red-500 text-sm mt-1">{errors.leaveName}</p>}
                        </div>

                        {/* Leave Code */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Leave Code <span className="text-red-500">*</span></label>
                            <input
                                name="leaveCode"
                                value={formData.leaveCode}
                                onChange={handleChange}
                                placeholder="e.g. SL"
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.leaveCode ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                            />
                            {errors.leaveCode && <p className="text-red-500 text-sm mt-1">{errors.leaveCode}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950"
                                rows={2}
                            />
                        </div>

                        {/* Default Days & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Default Days <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="defaultDays"
                                    value={formData.defaultDays}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.defaultDays ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-[#6C63FF] hover:bg-[#5B52F5] px-5 py-2.5 text-sm font-medium text-white  transition-colors"
                        >
                            {loading ? <Loader size="sm" /> : "Save Leave Type"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLeaveTypeModal;