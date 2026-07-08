import React, {  useState } from 'react';
import { type DepartmentFormData } from '../../models/Department';
import Loader from "../../components/common/Loader";

interface AddDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddDepartment: (department: DepartmentFormData) => Promise<void>;
    loading: boolean;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
    isOpen,
    onClose,
    onAddDepartment,
    loading
}) => {

    const [formData, setFormData] = useState<DepartmentFormData>({
        departmentName: '',
        
    });
 
    const [errors, setErrors] = useState({
        departmentName: "",
        
    });

  

    if (!isOpen) return null;


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    

    const validateForm = () => {
        const newErrors = {
            departmentName: ""           
        };

        let isValid = true;

        if (!formData.departmentName.trim()) {
            newErrors.departmentName = "Department Name is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        await onAddDepartment(formData);
        
    };

 

    return (
        /* FIXED Backdrop wrapper */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            {/* CHANGED: Added flex flex-col and removed raw overflow-y-auto from container */}
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-xl">

                {/* Header (Sticky at top) */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Department</h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                {/* CHANGED: Made the form a flex element wrapper containing scrollable fields and a fixed footer */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

                    {/* Scrollable Fields Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-140px)]">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="departmentName"
                                placeholder="Department"
                                value={formData.departmentName}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.departmentName ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                            />
                            {errors.departmentName && <p className="text-red-500 text-sm mt-1">{errors.departmentName}</p>}
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
                            disabled={loading}
                            className="rounded-lg bg-[#6C63FF] hover:bg-[#5B52F5] px-5 py-2.5 text-sm font-medium text-white"
                        >
                            {loading ? (
                                <Loader size="sm" />
                            ) : (
                                "Add Department"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddDepartmentModal;