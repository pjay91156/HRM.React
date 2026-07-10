import { Edit2, Plus, Search, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import AddPerformanceCycleModal from "../components/modals/AddPerformaceCycle";
import DeletePerformanceCycleModal from "../components/modals/DeletePerformanceCycleModal";
import Loader from "../components/common/Loader";
import performanceCycleService from "../services/performanceCycleService";
import { PerformanceCycleStatus, type PerformanceCycle as PerformanceCycleModel, type PerformanceCycleFormData } from "../models/PerformaceCycle";

const statusLabels: Record<number, string> = {
    [PerformanceCycleStatus.Draft]: "Draft",
    [PerformanceCycleStatus.Active]: "Active",
    [PerformanceCycleStatus.Completed]: "Completed",
    [PerformanceCycleStatus.Cancelled]: "Cancelled",
};
const getStatusTopBorder = (status: PerformanceCycleStatus) => {
    switch (status) {
        case PerformanceCycleStatus.Draft:
            return "border-t-4 border-t-amber-500";

        case PerformanceCycleStatus.Active:
            return "border-t-4 border-t-emerald-500";

        case PerformanceCycleStatus.Completed:
            return "border-t-4 border-t-indigo-500";

        case PerformanceCycleStatus.Cancelled:
            return "border-t-4 border-t-red-500";

        default:
            return "border-t-4 border-t-slate-300";
    }
};

const getStatusBadge = (status: PerformanceCycleStatus) => {
    switch (status) {
        case PerformanceCycleStatus.Draft:
            return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";

        case PerformanceCycleStatus.Active:
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";

        case PerformanceCycleStatus.Completed:
            return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";

        case PerformanceCycleStatus.Cancelled:
            return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";

        default:
            return "bg-slate-100 text-slate-700";
    }
};

const PerformanceCycle: React.FC = () => {
    const [cycles, setCycles] = useState<PerformanceCycleModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingCycle, setEditingCycle] = useState<PerformanceCycleModel | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [cycleToDelete, setCycleToDelete] = useState<PerformanceCycleModel | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState("All");

    const yearOptions = Array.from({ length: 6 }, (_, index) => currentYear - index);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    useEffect(() => {
        loadCycles();
    }, []);

    const loadCycles = async () => {
        try {
            setLoading(true);
            const response = await performanceCycleService.getPerformanceCycles();
            setCycles(response.data || []);
        } catch (error) {
            console.error("Error loading performance cycles:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value: string) => {
        if (!value) return "Start Date";

        return new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const openAddModal = () => {
        setEditingCycle(null);
        setIsModalOpen(true);
    };

    const openEditModal = (cycle: PerformanceCycleModel) => {
        setEditingCycle(cycle);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCycle(null);
    };

    const handleSubmitCycle = async (data: PerformanceCycleFormData) => {
        try {
            setSaving(true);

            if (editingCycle) {
                await performanceCycleService.updatePerformanceCycle(editingCycle.id, data);
            } else {
                await performanceCycleService.addPerformanceCycle(data);
            }

            closeModal();
            await loadCycles();
        } catch (error) {
            console.error("Error saving performance cycle:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (cycle: PerformanceCycleModel) => {
        setCycleToDelete(cycle);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!cycleToDelete) return;

        try {
            setDeleting(true);
            await performanceCycleService.deletePerformanceCycle(cycleToDelete.id);

            setIsDeleteModalOpen(false);
            setCycleToDelete(null);
            await loadCycles();
        } catch (error) {
            console.error("Error deleting performance cycle:", error);
        } finally {
            setDeleting(false);
        }
    };

    const filteredCycles = useMemo(() => {
        return cycles.filter((cycle) => {
            const matchesSearch = cycle.cycleName
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "All" ||
                cycle.status === Number(statusFilter);

            const cycleYear = new Date(cycle.reviewPeriodStart).getFullYear();

            const matchesYear =
                selectedYear === "All" ||
                cycleYear === Number(selectedYear);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesYear
            );
        });
    }, [cycles, search, statusFilter, selectedYear]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Performance Cycles</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage review cycles, phase windows, and status for your organisation</p>
                </div>
                <button className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm" onClick={openAddModal}>
                    <Plus size={18} /> Add Cycle
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col xl:flex-row gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700  shadow-sm">

                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search cycles by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 rounded-full
                       border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       pl-11 pr-4
                       text-sm text-slate-900 dark:text-white
                       placeholder:text-slate-400
                       focus:outline-none
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:border-[#6C63FF]"
                    />
                </div>

                {/* Year */}
                <div className="w-full sm:w-56">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full h-11 rounded-xl
                   border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-800
                   px-4
                   text-sm text-slate-900 dark:text-white
                   focus:outline-none
                   focus:ring-2 focus:ring-[#6C63FF]/20
                   focus:border-[#6C63FF]"
                    >
                        <option value="All">All Years</option>

                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="w-full sm:w-56">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-11 rounded-xl
                       border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800
                       px-4
                       text-sm text-slate-900 dark:text-white
                       focus:outline-none
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:border-[#6C63FF]"
                    >
                        <option value="All">All Statuses</option>
                        <option value={PerformanceCycleStatus.Draft}>Draft</option>
                        <option value={PerformanceCycleStatus.Active}>Active</option>
                        <option value={PerformanceCycleStatus.Completed}>Completed</option>
                        <option value={PerformanceCycleStatus.Cancelled}>Cancelled</option>
                    </select>
                </div>

            </div>

            {/* CARDS GRID */}
            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && filteredCycles.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No performance cycles found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search terms or filters, or add a new cycle.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCycles.map((cycle) => (
                        <div
                            key={cycle.id}
                            className={`bg-white dark:bg-slate-800
                p-6
                rounded-2xl
                border
                border-slate-200
                dark:border-slate-700
                ${getStatusTopBorder(cycle.status)}
                shadow-sm
                hover:shadow-lg
                hover:-translate-y-1
                transition-all
                duration-300`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl dark:text-white">{cycle.cycleName}</h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusBadge(
                                        cycle.status
                                    )}`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {statusLabels[cycle.status]}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-5">{formatDate(cycle.reviewPeriodStart)} — {formatDate(cycle.reviewPeriodEnd)}</p>

                            {/* Progress Bar Mock */}
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full mb-4 flex overflow-hidden">
                                <div className="w-2/3 bg-indigo-500"></div>
                                <div className="w-1/3 bg-cyan-400"></div>
                            </div>

                            <div className="flex gap-4 mb-4 text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Employee phase</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Manager phase</span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setExpandedCard(
                                        expandedCard === cycle.id ? null : cycle.id
                                    )
                                }
                                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 mb-4 transition-colors"
                            >
                                {expandedCard === cycle.id ? (
                                    <>
                                        <ChevronUp size={16} />
                                        Hide phase details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} />
                                        Show phase dates
                                    </>
                                )}
                            </button>
                            {expandedCard === cycle.id && (

                                <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-4 animate-fade-in">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Employee Review */}

                                        <div>

                                            <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                                                Employee Review
                                            </h4>

                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(cycle.employeeReviewStart)} → {formatDate(cycle.employeeReviewEnd)}
                                            </p>

                                        </div>

                                        {/* Manager Review */}

                                        <div>

                                            <h4 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                                                Manager Review
                                            </h4>

                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(cycle.managerReviewStart)} → {formatDate(cycle.managerReviewEnd)}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}

                            <div className="flex gap-3 border-t pt-4">
                                <button
                                    onClick={() => openEditModal(cycle)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(cycle)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddPerformanceCycleModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitCycle}
                loading={saving}
                editingCycle={editingCycle}
            />

            <DeletePerformanceCycleModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                cycleName={cycleToDelete?.cycleName ?? ""}
                loading={deleting}
            />
        </div>
    );
};
export default PerformanceCycle;
