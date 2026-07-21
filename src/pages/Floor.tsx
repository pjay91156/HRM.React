import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Layers3
} from 'lucide-react';

import floorService from '../services/floorService';
import { type Floor, type FloorFormData } from "../models/Floor";
import AddFloorModal from '../components/modals/AddFloorModal';
import DeleteFloorModal from '../components/modals/DeleteFloorModal';
import Loader from "../components/common/Loader";

const FloorsTable: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingFloor, setEditingFloor] = useState<Floor | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);

    useEffect(() => {
        loadFloors();
    }, []);

    const loadFloors = async () => {
        try {
            setLoading(true);
            const response = await floorService.getFloors();
            setFloors(response.data || []);
        } catch (error) {
            console.error("Error loading floors:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFloors = floors.filter(floor =>
        floor.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const usedFloorNames = useMemo(
        () =>
            floors
                .filter((floor) => floor.id !== editingFloor?.id)
                .map((floor) => floor.name.toLowerCase()),
        [floors, editingFloor]
    );

    const openAddModal = () => {
        setEditingFloor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (floor: Floor) => {
        setEditingFloor(floor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFloor(null);
    };

    const handleSubmitFloor = async (data: FloorFormData) => {
        try {
            setSaving(true);

            if (editingFloor) {
                await floorService.updateFloor(editingFloor.id, data);
            } else {
                await floorService.addFloor(data);
            }

            closeModal();
            await loadFloors();
        } catch (error) {
            console.error("Error saving floor:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (floor: Floor) => {
        setFloorToDelete(floor);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!floorToDelete) return;

        try {
            setDeleting(true);
            await floorService.deleteFloor(floorToDelete.id);

            setIsDeleteModalOpen(false);
            setFloorToDelete(null);
            await loadFloors();
        } catch (error) {
            console.error("Error deleting floor:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Floors</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage the office floors available for meeting room bookings</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
                    onClick={openAddModal}
                >
                    <Plus size={16} />
                    Add Floor
                </button>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search floors..."
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
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Floor Name</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Description</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold text-right bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredFloors.map(floor => (
                                <tr key={floor.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{floor.name}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{floor.description || "—"}</div>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-[#6C63FF] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
                                                onClick={() => openEditModal(floor)}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(floor)}
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
                {!loading && filteredFloors.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <Layers3 size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No floors found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms, or add a new floor to get started.
                        </p>
                    </div>
                )}
            </div>

            <AddFloorModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitFloor}
                loading={saving}
                editingFloor={editingFloor}
                usedFloorNames={usedFloorNames}
            />
            <DeleteFloorModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                floorName={floorToDelete?.name ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default FloorsTable;
