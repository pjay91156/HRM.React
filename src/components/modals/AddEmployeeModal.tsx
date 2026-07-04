import React, { useEffect, useState, useRef } from 'react';
import { type Department } from '../../models/Department';
import departmentservice from '../../services/departmemtService';
import designationService from '../../services/designationService';
import employeeService from '../../services/employeeService';
import { type EmployeeFormData } from '../../models/Employee';
import Loader from "../../components/common/Loader";

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEmployee: (employee: EmployeeFormData) => Promise<void>;
    loading: boolean;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
    isOpen,
    onClose,
    onAddEmployee,
    loading
}) => {

    const [formData, setFormData] = useState<EmployeeFormData>({
        firstName: '',
        lastName: '',
        email: '',
        empCode: '',
        phone: '',
        departmentId: '',
        designationId: '',
        managerId: '', // Fixed: unified field name from managerId to managerId
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        empCode: "",
        phone: "",
        departmentId: "",
        designationId: "",
        managerId: ""
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
    const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);
    const managerRef = useRef<HTMLDivElement>(null);
    const designationContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (formData.departmentId) {
            loadDesignations(formData.departmentId);
        } else {
            setDesignations([]);
        }
    }, [formData.departmentId]);

    useEffect(() => {
        if (isOpen) {
            loadDepartments();
            loadEmployees();
        }
    }, [isOpen]);

    // Outside click handlers for custom dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (destRef.current && !destRef.current.contains(event.target as Node)) {
                setIsDestDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (managerRef.current && !managerRef.current.contains(event.target as Node)) {
                setIsManagerDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const loadDepartments = async () => {
        try {
            const response = await departmentservice.getDepartments();
            setDepartments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadDesignations = async (departmentId: string) => {
        try {
            const response = await designationService.getDesignations(departmentId);
            setDesignations(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadEmployees = async () => {
        try {
            const response = await employeeService.getEmployees();
            setEmployees(response.data || response);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleDepartmentSelect = (id: string) => {
        setFormData(prev => ({ ...prev, departmentId: id, designationId: "" }));
        setErrors(prev => ({ ...prev, departmentId: "", designationId: "" }));
        setIsDropdownOpen(false);
    };

    const validateForm = () => {
        const newErrors = {
            firstName: "",
            lastName: "",
            email: "",
            empCode: "",
            phone: "",
            departmentId: "",
            designationId: "",
            managerId: ""
        };

        let isValid = true;

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First Name is required";
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last Name is required";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Invalid email address";
            isValid = false;
        }

        if (!formData.empCode.trim()) {
            newErrors.empCode = "Employee Code is required";
            isValid = false;
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required";
            isValid = false;
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone must contain 10 digits";
            isValid = false;
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Department is required";
            isValid = false;
        }

        if (!formData.designationId) {
            newErrors.designationId = "Designation is required";
            isValid = false;
        }

        if (!formData.managerId) {
            newErrors.managerId = "Reporting Manager is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        await onAddEmployee(formData);
    };

    const selectedDepartment = departments.find(x => x.id === formData.departmentId);
    const selectedDesignation = designations.find(x => x.id === formData.designationId);
    const selectedManager = employees.find(x => x.id === formData.managerId); // Fixed property to match state

    return (
        /* FIXED Backdrop wrapper */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl">

                {/* Header (Sticky at top) */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add Employee</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

                    {/* Scrollable Fields Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-140px)]">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.firstName ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Smith"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.lastName ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.email ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Employee Code */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Employee Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="empCode"
                                placeholder="EMP001"
                                value={formData.empCode}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.empCode ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.empCode && <p className="text-red-500 text-sm mt-1">{errors.empCode}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        {/* Department Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.departmentId ? "border-red-500" : "border-gray-200"}`}
                                >
                                    <span className={selectedDepartment ? "text-gray-900" : "text-gray-400"}>
                                        {selectedDepartment ? selectedDepartment.departmentName : "Select Department"}
                                    </span>
                                    <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                                        <div className="max-h-60 overflow-y-auto">
                                            {departments.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">No departments found</div>
                                            ) : (
                                                departments.map((department) => (
                                                    <button
                                                        key={department.id}
                                                        type="button"
                                                        onClick={() => handleDepartmentSelect(department.id)}
                                                        className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${formData.departmentId === department.id ? "bg-gray-50 font-medium" : ""}`}
                                                    >
                                                        {department.departmentName}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>}
                        </div>

                        {/* Designation Dropdown */}
                        <div ref={designationContainerRef}>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Role / Designation <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={destRef}>
                                <button
                                    type="button"
                                    disabled={!formData.departmentId}
                                    onClick={() => {
                                        if (!isDestDropdownOpen) {
                                            designationContainerRef.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }
                                        setIsDestDropdownOpen(!isDestDropdownOpen);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${errors.designationId ? "border-red-500" : "border-gray-200"} ${!formData.departmentId ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-gray-50"}`}
                                >
                                    <span className={selectedDesignation ? "text-gray-900" : "text-gray-400"}>
                                        {!formData.departmentId ? "Please select department first" : selectedDesignation?.designationName || "Select Designation"}
                                    </span>
                                    <svg className={`h-4 w-4 transition-transform ${isDestDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDestDropdownOpen && formData.departmentId && (
                                    <div className="absolute bottom-full mb-1 z-50 w-full rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                                        <div className="max-h-48 overflow-y-auto">
                                            {designations.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">No Designations</div>
                                            ) : (
                                                designations.map((dest) => (
                                                    <button
                                                        key={dest.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, designationId: dest.id }));
                                                            setErrors(prev => ({ ...prev, designationId: "" }));
                                                            setIsDestDropdownOpen(false);
                                                        }}
                                                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                                                    >
                                                        {dest.designationName || dest.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.designationId && <p className="text-red-500 text-sm mt-1">{errors.designationId}</p>}
                        </div>

                        {/* Reporting Manager Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Reporting Manager <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={managerRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm bg-gray-50 ${errors.managerId ? "border-red-500" : "border-gray-200"}`}
                                >
                                    <span className={selectedManager ? "text-gray-900" : "text-gray-400"}>
                                        {selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : "Select Reporting Manager"}
                                    </span>
                                    <svg className={`h-4 w-4 transition-transform ${isManagerDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isManagerDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                                        <div className="max-h-48 overflow-y-auto">
                                            {employees.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">No employees found</div>
                                            ) : (
                                                employees.map((emp) => (
                                                    <button
                                                        key={emp.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, managerId: emp.id }));
                                                            setErrors(prev => ({ ...prev, managerId: "" }));
                                                            setIsManagerDropdownOpen(false);
                                                        }}
                                                        className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${formData.managerId === emp.id ? "bg-gray-50 font-medium" : ""}`}
                                                    >
                                                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.managerId && <p className="text-red-500 text-sm mt-1">{errors.managerId}</p>}
                        </div>

                    </div>

                    {/* Buttons Footer (Sticky at bottom) */}
                    <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-white rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium bg-white hover:bg-gray-50"
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
                                "Add Employee"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;