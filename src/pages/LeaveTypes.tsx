import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import leaveTypeService from '../services/leaveTypeService';
import { type LeaveTypeResponse } from "../models/LeaveType";
import AddLeaveTypeModal from '../components/modals/AddLeaveTypeModal';
import DeleteLeaveTypeModal from '../components/modals/DeleteLeaveTypeModal';
import Loader from "../components/common/Loader";

const LeaveTypes: React.FC = () => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selected, setSelected] = useState<LeaveTypeResponse | null>(null);

    useEffect(() => { loadLeaveTypes(); }, []);

    const loadLeaveTypes = async () => {
        try {
            setLoading(true);
            const response = await leaveTypeService.getLeaveTypes();
            setLeaveTypes(response.data || []);
        } catch (error) {
            console.error("Error loading leave types:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (data: any) => {
        await leaveTypeService.addLeaveType(data);
        setIsAddModalOpen(false);
        loadLeaveTypes();
    };

    const handleConfirmDelete = async () => {
        if (!selected) return;
        await leaveTypeService.deleteLeaveType(selected.id);
        setIsDeleteModalOpen(false);
        loadLeaveTypes();
    };

    const filteredLeaveTypes = leaveTypes.filter(lt =>
        lt.leaveName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lt.leaveCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Leave Types</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and configure your leave policies</p>
                </div>
                <button 
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm" 
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={16} />
                    Add Leave Type
                </button>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                <Search size={18} className="text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or code..."
                    className="w-full bg-transparent outline-none text-slate-600 placeholder-slate-400 text-sm"
                />
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
                                <th className="py-3.5 px-6 font-semibold">Leave Type</th>
                                <th className="py-3.5 px-4 font-semibold">Code</th>
                                <th className="py-3.5 px-4 font-semibold">Description</th>
                                <th className="py-3.5 px-4 font-semibold">Default Days</th>
                                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredLeaveTypes.map(lt => (
                                <tr key={lt.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6 font-medium text-slate-900 text-sm">{lt.leaveName}</td>
                                    <td className="py-4 px-4 text-sm font-mono text-slate-500">{lt.leaveCode}</td>
                                    <td className="py-4 px-4 text-sm text-slate-600">{lt.description}</td>
                                    <td className="py-4 px-4 text-sm text-slate-900">{lt.defaultDays}</td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                                                <Edit2 size={15} />
                                            </button>
                                            <button 
                                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                                onClick={() => {setSelected(lt); setIsDeleteModalOpen(true);}}
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
                {!loading && filteredLeaveTypes.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900">No leave types found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms to find what you are looking for.
                        </p>
                    </div>
                )}
            </div>

            <AddLeaveTypeModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAddLeaveType={handleAdd} 
                loading={false} 
            />
            <DeleteLeaveTypeModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
                leaveTypeName={selected?.leaveName || ""} 
            />
        </div>
    );
};

export default LeaveTypes;