import { Edit2, Plus, Search, Trash2, ListOrdered } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import AddPerformanceRatingModal from "../components/modals/AddPerformanceRatingModal";
import DeletePerformanceRatingModal from "../components/modals/DeletePerformanceRatingModal";
import StarRating from "../components/common/StarRating";
import Loader from "../components/common/Loader";
import performanceRatingService from "../services/performanceRatingService";
import { type PerformanceRating, type PerformanceRatingFormData } from "../models/PerformanceRating";

const getRatingAccent = (rating: number) => {
    if (rating >= 5) {
        return {
            bar: "bg-emerald-500",
            badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        };
    }
    if (rating === 4) {
        return {
            bar: "bg-sky-500",
            badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
        };
    }
    if (rating === 3) {
        return {
            bar: "bg-amber-500",
            badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        };
    }
    if (rating === 2) {
        return {
            bar: "bg-orange-500",
            badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
        };
    }
    return {
        bar: "bg-red-500",
        badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
    };
};

const PerformanceRatingPage: React.FC = () => {
    const [ratings, setRatings] = useState<PerformanceRating[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingRating, setEditingRating] = useState<PerformanceRating | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [ratingToDelete, setRatingToDelete] = useState<PerformanceRating | null>(null);

    const [search, setSearch] = useState("");

    useEffect(() => {
        loadRatings();
    }, []);

    const loadRatings = async () => {
        try {
            setLoading(true);
            const response = await performanceRatingService.getPerformanceRatings();
            setRatings(response.data || []);
        } catch (error) {
            console.error("Error loading performance ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingRating(null);
        setIsModalOpen(true);
    };

    const openEditModal = (rating: PerformanceRating) => {
        setEditingRating(rating);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRating(null);
    };

    const handleSubmitRating = async (data: PerformanceRatingFormData) => {
        try {
            setSaving(true);

            if (editingRating) {
                await performanceRatingService.updatePerformanceRating(editingRating.id, data);
            } else {
                await performanceRatingService.addPerformanceRating(data);
            }

            closeModal();
            await loadRatings();
        } catch (error) {
            console.error("Error saving performance rating:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (rating: PerformanceRating) => {
        setRatingToDelete(rating);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!ratingToDelete) return;

        try {
            setDeleting(true);
            await performanceRatingService.deletePerformanceRating(ratingToDelete.id);

            setIsDeleteModalOpen(false);
            setRatingToDelete(null);
            await loadRatings();
        } catch (error) {
            console.error("Error deleting performance rating:", error);
        } finally {
            setDeleting(false);
        }
    };

    const filteredRatings = useMemo(() => {
        return ratings
            .filter((rating) =>
                rating.ratingName.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }, [ratings, search]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Performance Ratings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Define the rating scale used to evaluate employee performance</p>
                </div>
                <button className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm" onClick={openAddModal}>
                    <Plus size={18} /> Add Rating
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Search
                    size={18}
                    className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="text"
                    placeholder="Search ratings by name..."
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

            {/* RATINGS LIST */}
            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && filteredRatings.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <Search size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No performance ratings found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search, or add a new rating to the scale.
                        </p>
                    </div>
                )}

                {filteredRatings.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {filteredRatings.map((rating) => {
                            const accent = getRatingAccent(rating.rating);

                            return (
                                <div
                                    key={rating.id}
                                    className="flex items-stretch hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    <div className={`w-1.5 shrink-0 ${accent.bar}`} />

                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-4 px-5">
                                        <span
                                            className={`shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${accent.badge}`}
                                        >
                                            <ListOrdered size={12} />
                                            #{rating.displayOrder}
                                        </span>

                                        <div className="sm:w-52 shrink-0">
                                            <h3 className="font-bold text-base dark:text-white">{rating.ratingName}</h3>
                                            <StarRating value={rating.rating} size={16} className="mt-1" />
                                        </div>

                                        <p className="flex-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {rating.description || "No description provided."}
                                        </p>

                                        <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                                            <button
                                                onClick={() => openEditModal(rating)}
                                                title="Edit"
                                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(rating)}
                                                title="Delete"
                                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AddPerformanceRatingModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitRating}
                loading={saving}
                editingRating={editingRating}
            />

            <DeletePerformanceRatingModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                ratingName={ratingToDelete?.ratingName ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default PerformanceRatingPage;
