import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Mail,
    Phone,
    Edit2,
    Trash2
} from 'lucide-react';

import employeeService from '../services/employeeService';
import { type EmployeeResponse } from "../models/Employee";
import AddEmployeeModal from '../components/modals/AddEmployeeModal';
import Loader from "../components/common/Loader";
import DeleteEmployeeModal from '../components/modals/DeleteEmployeeModal';

const EmployeesTable: React.FC = () => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);

    const handleAddEmployeeSubmit = async (newEmployeeData: any) => {
        try {
            setAddEmployeeLoading(true);
            const response = await employeeService.addEmployee(newEmployeeData);
            alert("Employee added successfully!");

            setIsModalOpen(false);
            await loadEmployees();
        } catch (error) {
            console.error(error);
            alert("Failed to add employee.");
        }
        finally {
            setAddEmployeeLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getEmployees();
            setEmployees(response.data);
        } catch (error) {
            console.error("Error loading employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteClick = (emp: EmployeeResponse) => {
        setSelectedEmployee(emp);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedEmployee) return;

        try {
            setLoading(true);
            setIsDeleteModalOpen(false);

            await employeeService.deleteEmployee(selectedEmployee.id);

            alert("Employee removed successfully.");
            loadEmployees();
        } catch (error) {
            console.error(error);
            alert("Failed to delete employee.");
        } finally {
            setLoading(false);
            setSelectedEmployee(null);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Employees</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and organize your team members</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} />
                    Add Employee
                </button>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                <Search size={18} className="text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email or department..."
                    className="w-full bg-transparent outline-none text-slate-600 placeholder-slate-400 text-sm"
                />
            </div>

            {/* TABLE CONTAINER */}
            {/* Note: min-h style removed so the wrapper collapses naturally to fit a small number of rows */}
            <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                {loading && (
                    <div className="absolute inset-x-0 bottom-0 top-[45px] z-40 bg-white/60 backdrop-blur-[1px] transition-all">
                        <Loader />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="relative z-30 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-6 font-semibold">Employee</th>
                                <th className="py-3.5 px-4 font-semibold">Contact</th>
                                <th className="py-3.5 px-4 font-semibold">Department</th>
                                <th className="py-3.5 px-4 font-semibold">Designation</th>
                                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 text-sm">{emp.firstName} {emp.lastName}</div>
                                        <div className="text-xs font-mono text-slate-400 mt-0.5">{emp.employeeCode || "N/A"}</div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Mail size={14} className="text-slate-400" />
                                            <span>{emp.email}</span>
                                        </div>
                                        {emp.phone && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <Phone size={13} className="text-slate-300" />
                                                <span>{emp.phone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                                            {emp.departmentName}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-600">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                            {emp.designationName}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(emp)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* EMPTY STATE */}
                {!loading && filteredEmployees.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900">No employees found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms or filters to find what you are looking for.
                        </p>
                    </div>
                )}
            </div>

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEmployee={handleAddEmployeeSubmit}
                loading={addEmployeeLoading}
            />
            <DeleteEmployeeModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ""}
            />
        </div>
    );
};

export default EmployeesTable;