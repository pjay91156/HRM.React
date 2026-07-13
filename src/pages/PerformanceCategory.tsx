import { ArrowLeft, Edit2, ListOrdered, Plus, Trash2, LayoutGrid, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import AddPerformanceCategoryModal from "../components/modals/AddPerformanceCategoryModal";
import DeletePerformanceCategoryModal from "../components/modals/DeletePerformanceCategoryModal";
import Loader from "../components/common/Loader";
import performanceCategoryService from "../services/performanceCategoryService";
import performanceTemplateService from "../services/performanceTemplateService";
import { type PerformanceCategory, type PerformanceCategoryFormData } from "../models/PerformanceCategory";
import { type PerformanceTemplate } from "../models/PerformanceTemplate";

const MAX_TOTAL_WEIGHTAGE = 100;

const PerformanceCategoryPage: React.FC = () => {
    const { templateId } = useParams<{ templateId: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PerformanceTemplate | null>(null);
    const [categories, setCategories] = useState<PerformanceCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<PerformanceCategory | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [categoryToDelete, setCategoryToDelete] = useState<PerformanceCategory | null>(null);

    useEffect(() => {
        if (templateId) {
            loadData(templateId);
        }
    }, [templateId]);

    const loadData = async (id: string) => {
        try {
            setLoading(true);
            const [templateResponse, categoriesResponse] = await Promise.all([
                performanceTemplateService.getPerformanceTemplateById(id),
                performanceCategoryService.getPerformanceCategoriesByTemplate(id)
            ]);
            setTemplate(templateResponse.data ?? null);
            setCategories(categoriesResponse.data || []);
        } catch (error) {
            console.error("Error loading performance categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.displayOrder - b.displayOrder),
        [categories]
    );

    const totalWeightage = useMemo(
        () => categories.reduce((sum, category) => sum + category.weightage, 0),
        [categories]
    );

    const remainingWeightage = useMemo(() => {
        const excludingEditing = editingCategory
            ? totalWeightage - editingCategory.weightage
            : totalWeightage;

        return Math.max(0, Math.round((MAX_TOTAL_WEIGHTAGE - excludingEditing) * 100) / 100);
    }, [totalWeightage, editingCategory]);

    const usedCategoryNames = useMemo(
        () =>
            categories
                .filter((category) => category.id !== editingCategory?.id)
                .map((category) => category.categoryName.toLowerCase()),
        [categories, editingCategory]
    );

    const usedDisplayOrders = useMemo(
        () =>
            categories
                .filter((category) => category.id !== editingCategory?.id)
                .map((category) => category.displayOrder),
        [categories, editingCategory]
    );

    const canAddCategory = totalWeightage < MAX_TOTAL_WEIGHTAGE;

    const openAddModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category: PerformanceCategory) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmitCategory = async (data: PerformanceCategoryFormData) => {
        if (!templateId) return;

        try {
            setSaving(true);

            if (editingCategory) {
                await performanceCategoryService.updatePerformanceCategory(editingCategory.id, data);
            } else {
                await performanceCategoryService.addPerformanceCategory(templateId, data);
            }

            closeModal();
            await loadData(templateId);
        } catch (error) {
            console.error("Error saving performance category:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (category: PerformanceCategory) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete || !templateId) return;

        try {
            setDeleting(true);
            await performanceCategoryService.deletePerformanceCategory(categoryToDelete.id);

            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            await loadData(templateId);
        } catch (error) {
            console.error("Error deleting performance category:", error);
        } finally {
            setDeleting(false);
        }
    };

    const weightageBarColor =
        totalWeightage >= MAX_TOTAL_WEIGHTAGE ? "bg-emerald-500" : "bg-[#6C63FF]";

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            {/* HEADER */}
            <div>
                <button
                    onClick={() => navigate("/performance-templates")}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#6C63FF] dark:hover:text-indigo-400 mb-3 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Templates
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {template ? template.templateName : "Skill Categories"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {template
                                ? `Define skill categories and weightage for ${template.departmentName}`
                                : "Define skill categories and their weightage for this template"}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                            onClick={openAddModal}
                            disabled={!canAddCategory}
                            title={!canAddCategory ? "Weightage is fully allocated (100%)" : undefined}
                        >
                            <Plus size={18} /> Add Category
                        </button>
                        {!loading && !canAddCategory && categories.length > 0 && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                Weightage fully allocated
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* WEIGHTAGE SUMMARY */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Weightage Allocated</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {totalWeightage}% / {MAX_TOTAL_WEIGHTAGE}%
                    </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${weightageBarColor}`}
                        style={{ width: `${Math.min(totalWeightage, MAX_TOTAL_WEIGHTAGE)}%` }}
                    />
                </div>
            </div>

            {/* CATEGORY LIST */}
            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && sortedCategories.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <LayoutGrid size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No skill categories yet</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Add a category and assign it a weightage to build out this template.
                        </p>
                    </div>
                )}

                {sortedCategories.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {sortedCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-stretch hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <div className="w-1.5 shrink-0 bg-[#6C63FF]" />

                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-4 px-5">
                                    <span className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                        <ListOrdered size={12} />
                                        #{category.displayOrder}
                                    </span>

                                    <h3 className="flex-1 font-bold text-base dark:text-white">{category.categoryName}</h3>

                                    <span className="shrink-0 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        {category.weightage}% weightage
                                    </span>

                                    <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                                        <button
                                            onClick={() => navigate(`/performance-templates/${templateId}/categories/${category.id}/skills`)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#6C63FF]/30 text-sm font-medium text-[#6C63FF] hover:bg-[#6C63FF]/10 dark:text-indigo-400 dark:border-indigo-400/30 dark:hover:bg-indigo-500/10"
                                        >
                                            <Sparkles size={16} /> Skills
                                        </button>
                                        <button
                                            onClick={() => openEditModal(category)}
                                            title="Edit"
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category)}
                                            title="Delete"
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddPerformanceCategoryModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitCategory}
                loading={saving}
                editingCategory={editingCategory}
                remainingWeightage={remainingWeightage}
                usedCategoryNames={usedCategoryNames}
                usedDisplayOrders={usedDisplayOrders}
            />

            <DeletePerformanceCategoryModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                categoryName={categoryToDelete?.categoryName ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default PerformanceCategoryPage;
