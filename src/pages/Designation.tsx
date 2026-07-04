import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    ChevronDown // Added for custom dropdown arrow styling
} from 'lucide-react';

import designationService from '../services/designationService';
import { type Designation } from "../models/Designation";
import AddDesignationModal from '../components/modals/AddDesignation';
import Loader from "../components/common/Loader";
import DeleteDesignationModal from '../components/modals/DeleteDesignationModal';

const DesignationsTable: React.FC = () => {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [addDesignationLoading, setAddDesignationLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);

    const handleAddDesignationSubmit = async (newDesignationData: any) => {
        try {
            setAddDesignationLoading(true);
            await designationService.addDesignation(newDesignationData);
            setIsModalOpen(false);
            await loadDesignations();
        } catch (error) {
            console.error(error);
            alert("Failed to add designation.");
        } finally {
            setAddDesignationLoading(false);
        }
    };

    useEffect(() => {
        loadDesignations();
    }, []);

    const loadDesignations = async () => {
        try {
            setLoading(true);
            const response = await designationService.getAllDesignations();
            setDesignations(response.data);
        } catch (error) {
            console.error("Error loading designations:", error);
        } finally {
            setLoading(false);
        }
    };

    const uniqueDepartments = Array.from(
        new Set(
            designations
                .map((des) => des.departmentName)
                .filter(Boolean)
        )
    );

    const filteredDesignations = designations.filter(des => {
        const matchesSearch = des.designationName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === "" || des.departmentName === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const handleDeleteClick = (des: Designation) => {
        setSelectedDesignation(des);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDesignation) return;
        try {
            setLoading(true);
            setIsDeleteModalOpen(false);
            await designationService.deleteDesignation(selectedDesignation.id);
            loadDesignations();
        } catch (error) {
            console.error(error);
            alert("Failed to delete designation.");
        } finally {
            setLoading(false);
            setSelectedDesignation(null);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Designations</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and organize company job titles and roles</p>
                </div>
                <button 
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm" 
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} />
                    Add Designation
                </button>
            </div>

            {/* CONTROLS (SEARCH & ATTRACTIVE FILTER) */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* SEARCH BAR */}
                <div className="flex-1 flex items-center bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                    <Search size={18} className="text-slate-400 mr-2.5 flex-shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search designations..."
                        className="w-full bg-transparent outline-none text-slate-600 placeholder-slate-400 text-sm"
                    />
                </div>

                {/* VISUALLY ATTRACTIVE DEPARTMENT FILTER */}
                <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150 min-w-[220px]">
                    <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Filter size={15} />
                    </div>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-700 text-sm font-medium py-2.5 pl-2.5 pr-10 cursor-pointer appearance-none z-10"
                    >
                        <option value="">All Departments</option>
                        {uniqueDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                    {/* Custom Arrow overlay */}
                    <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 z-0">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
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
                                <th className="py-3.5 px-6 font-semibold">Designation Title</th>
                                <th className="py-3.5 px-6 font-semibold">Department</th>
                                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredDesignations.map(des => (
                                <tr key={des.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 text-sm">{des.designationName}</div>
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                            {des.departmentName || 'N/A'}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(des)}
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

                {!loading && filteredDesignations.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900">No designations found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms or filters to find what you are looking for.
                        </p>
                    </div>
                )}
            </div>

            <AddDesignationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddDesignation={handleAddDesignationSubmit}
                loading={addDesignationLoading}
            />
            <DeleteDesignationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                designationName={selectedDesignation?.designationName ?? ""}
            />
        </div>
    );
};

export default DesignationsTable;