import { ArrowLeft, Edit2, ListOrdered, Plus, Trash2, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import AddPerformanceSkillModal from "../components/modals/AddPerformanceSkillModal";
import DeletePerformanceSkillModal from "../components/modals/DeletePerformanceSkillModal";
import Loader from "../components/common/Loader";
import performanceSkillService from "../services/performanceSkillService";
import performanceCategoryService from "../services/performanceCategoryService";
import { type PerformanceSkill, type PerformanceSkillFormData } from "../models/PerformanceSkill";
import { type PerformanceCategory } from "../models/PerformanceCategory";

const MAX_TOTAL_WEIGHTAGE = 100;

const PerformanceSkillPage: React.FC = () => {
    const { templateId, categoryId } = useParams<{ templateId: string; categoryId: string }>();
    const navigate = useNavigate();

    const [category, setCategory] = useState<PerformanceCategory | null>(null);
    const [skills, setSkills] = useState<PerformanceSkill[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSkill, setEditingSkill] = useState<PerformanceSkill | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [skillToDelete, setSkillToDelete] = useState<PerformanceSkill | null>(null);

    useEffect(() => {
        if (categoryId) {
            loadData(categoryId);
        }
    }, [categoryId]);

    const loadData = async (id: string) => {
        try {
            setLoading(true);
            const [categoryResponse, skillsResponse] = await Promise.all([
                performanceCategoryService.getPerformanceCategoryById(id),
                performanceSkillService.getPerformanceSkillsByCategory(id)
            ]);
            setCategory(categoryResponse.data ?? null);
            setSkills(skillsResponse.data || []);
        } catch (error) {
            console.error("Error loading performance skills:", error);
        } finally {
            setLoading(false);
        }
    };

    const sortedSkills = useMemo(
        () => [...skills].sort((a, b) => a.displayOrder - b.displayOrder),
        [skills]
    );

    const totalWeightage = useMemo(
        () => skills.reduce((sum, skill) => sum + skill.weightage, 0),
        [skills]
    );

    const remainingWeightage = useMemo(() => {
        const excludingEditing = editingSkill
            ? totalWeightage - editingSkill.weightage
            : totalWeightage;

        return Math.max(0, Math.round((MAX_TOTAL_WEIGHTAGE - excludingEditing) * 100) / 100);
    }, [totalWeightage, editingSkill]);

    const usedSkillNames = useMemo(
        () =>
            skills
                .filter((skill) => skill.id !== editingSkill?.id)
                .map((skill) => skill.skillName.toLowerCase()),
        [skills, editingSkill]
    );

    const usedDisplayOrders = useMemo(
        () =>
            skills
                .filter((skill) => skill.id !== editingSkill?.id)
                .map((skill) => skill.displayOrder),
        [skills, editingSkill]
    );

    const canAddSkill = totalWeightage < MAX_TOTAL_WEIGHTAGE;

    const openAddModal = () => {
        setEditingSkill(null);
        setIsModalOpen(true);
    };

    const openEditModal = (skill: PerformanceSkill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSkill(null);
    };

    const handleSubmitSkill = async (data: PerformanceSkillFormData) => {
        if (!categoryId) return;

        try {
            setSaving(true);

            if (editingSkill) {
                await performanceSkillService.updatePerformanceSkill(editingSkill.id, data);
            } else {
                await performanceSkillService.addPerformanceSkill(categoryId, data);
            }

            closeModal();
            await loadData(categoryId);
        } catch (error) {
            console.error("Error saving performance skill:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (skill: PerformanceSkill) => {
        setSkillToDelete(skill);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!skillToDelete || !categoryId) return;

        try {
            setDeleting(true);
            await performanceSkillService.deletePerformanceSkill(skillToDelete.id);

            setIsDeleteModalOpen(false);
            setSkillToDelete(null);
            await loadData(categoryId);
        } catch (error) {
            console.error("Error deleting performance skill:", error);
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
                    onClick={() => navigate(`/performance-templates/${templateId}/categories`)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#6C63FF] dark:hover:text-indigo-400 mb-3 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Categories
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {category ? category.categoryName : "Skills"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Define skills and their weightage for this category
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                            onClick={openAddModal}
                            disabled={!canAddSkill}
                            title={!canAddSkill ? "Weightage is fully allocated (100%)" : undefined}
                        >
                            <Plus size={18} /> Add Skill
                        </button>
                        {!loading && !canAddSkill && skills.length > 0 && (
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

            {/* SKILL LIST */}
            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && sortedSkills.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No skills yet</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Add a skill and assign it a weightage to build out this category.
                        </p>
                    </div>
                )}

                {sortedSkills.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {sortedSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className="flex items-stretch hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <div className="w-1.5 shrink-0 bg-[#6C63FF]" />

                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-4 px-5">
                                    <span className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                        <ListOrdered size={12} />
                                        #{skill.displayOrder}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base dark:text-white">{skill.skillName}</h3>
                                        {skill.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                {skill.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="shrink-0 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        {skill.weightage}% weightage
                                    </span>

                                    <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                                        <button
                                            onClick={() => openEditModal(skill)}
                                            title="Edit"
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(skill)}
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

            <AddPerformanceSkillModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitSkill}
                loading={saving}
                editingSkill={editingSkill}
                remainingWeightage={remainingWeightage}
                usedSkillNames={usedSkillNames}
                usedDisplayOrders={usedDisplayOrders}
            />

            <DeletePerformanceSkillModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                skillName={skillToDelete?.skillName ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default PerformanceSkillPage;
