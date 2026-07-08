import React, { useState, useEffect } from 'react';
import { type DesignationFormData } from '../../models/Designation';
import { type Department } from '../../models/Department';
import departmentService from '../../services/departmemtService'; // Adjust path if needed
import Loader from "../../components/common/Loader";

interface AddDesignationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddDesignation: (designation: DesignationFormData) => Promise<void>;
    loading: boolean;
}

const AddDesignationModal: React.FC<AddDesignationModalProps> = ({
    isOpen,
    onClose,
    onAddDesignation,
    loading
}) => {
    // Dropdown options state
    const [departments, setDepartments] = useState<Department[]>([]);
    const [fetchingDepartments, setFetchingDepartments] = useState(false);

    const [formData, setFormData] = useState<DesignationFormData>({
        name: '',
        departmentId: '', // Links the designation to a department
    });
 
    const [errors, setErrors] = useState({
        name: "", // CHANGED: Key matches state field
        departmentId: "",
    });

    // Fetch departments for the dropdown selection when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadDepartments = async () => {
                try {
                    setFetchingDepartments(true);
                    const response = await departmentService.getDepartments();
                    setDepartments(response.data);
                } catch (error) {
                    console.error("Failed to load departments for dropdown", error);
                } finally {
                    setFetchingDepartments(false);
                }
            };
            loadDepartments();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {
            name: "", // CHANGED: Key matches state field
            departmentId: ""           
        };

        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "Designation Name is required";
            isValid = false;
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Department assignment is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        await onAddDesignation(formData);
    };

    return (
        /* Backdrop wrapper */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            {/* Container */}
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-xl">

                {/* Header (Sticky at top) */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Designation</h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

                    {/* Scrollable Fields Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-140px)]">
                        
                        {/* Department Dropdown Selection */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                disabled={fetchingDepartments}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                                    errors.departmentId ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                                }`}
                            >
                                <option value="">
                                    {fetchingDepartments ? "Loading departments..." : "Select Department"}
                                </option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>
                            )}
                        </div>

                        {/* Designation Name Input */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Designation Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name" // FIXED: Changed from "designationName" to "name"
                                placeholder="e.g. Senior Software Engineer"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                                    errors.name ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                    </div>

                    {/* Buttons Footer (Sticky at bottom) */}
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
                            disabled={loading || fetchingDepartments}
                            className="rounded-lg bg-[#6C63FF] hover:bg-[#5B52F5] px-5 py-2.5 text-sm font-medium text-white disabled:bg-gray-400"
                        >
                            {loading ? (
                                <Loader size="sm" />
                            ) : (
                                "Add Designation"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddDesignationModal;