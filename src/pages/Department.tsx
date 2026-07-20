import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2
} from 'lucide-react';

import departmentService from '../services/departmemtService';
import { type Department } from "../models/Department";
import AddDepartmentModal from '../components/modals/AddDepartment';
import Loader from "../components/common/Loader";
import DeleteDepartmentModal from '../components/modals/DeleteDepartment';

const DepartmentsTable: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [addDepartmentLoading, setAddDepartmentLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    const handleAddDeparatmentSubmit = async (newDepartmentData: any) => {
        try {
            setAddDepartmentLoading(true);
            const response = await departmentService.addDepartment(newDepartmentData);

            setIsModalOpen(false);
            await loadDepartments();
        } catch (error) {
            console.error(error);
        }
        finally {
            setAddDepartmentLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const response = await departmentService.getDepartments();
            setDepartments(response.data);
        } catch (error) {
            console.error("Error loading employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDepartments = departments.filter(dep =>
        dep.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteClick = (dep: Department) => {
        setSelectedDepartment(dep);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDepartment) return;

        try {
            setLoading(true);
            setIsDeleteModalOpen(false);

            await departmentService.deleteDepartment(selectedDepartment.id);

            loadDepartments();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSelectedDepartment(null);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Departments</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and organize company business divisions</p>
                </div>
                <button 
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm" 
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} />
                    Add Department
                </button>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
            </div>

            {/* TABLE CONTAINER */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">

                {loading && (
                    <div className="absolute inset-x-0 bottom-0 top-[45px] z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] transition-all">
                        <Loader />
                    </div>
                )}

                <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Department Name</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold text-right bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredDepartments.map(dep => (
                                <tr key={dep.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{dep.departmentName}</div>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(dep)}
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
                {!loading && filteredDepartments.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No departments found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms or filters to find what you are looking for.
                        </p>
                    </div>
                )}
            </div>

            <AddDepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddDepartment={handleAddDeparatmentSubmit}
                loading={addDepartmentLoading}
            />
            <DeleteDepartmentModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                departmentName={selectedDepartment?.departmentName ?? ""}
            />
        </div>
    );
};

export default DepartmentsTable;