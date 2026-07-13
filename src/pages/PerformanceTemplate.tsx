import { Edit2, Plus, Search, Trash2, Building2, FileStack, LayoutGrid } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AddPerformanceTemplateModal from "../components/modals/AddPerformanceTemplateModal";
import DeletePerformanceTemplateModal from "../components/modals/DeletePerformanceTemplateModal";
import Loader from "../components/common/Loader";
import performanceTemplateService from "../services/performanceTemplateService";
import departmentService from "../services/departmemtService";
import { type PerformanceTemplate, type PerformanceTemplateFormData } from "../models/PerformanceTemplate";
import { type Department } from "../models/Department";

const PerformanceTemplatePage: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingTemplate, setEditingTemplate] = useState<PerformanceTemplate | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [templateToDelete, setTemplateToDelete] = useState<PerformanceTemplate | null>(null);

    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [templatesResponse, departmentsResponse] = await Promise.all([
                performanceTemplateService.getPerformanceTemplates(),
                departmentService.getDepartments()
            ]);
            setTemplates(templatesResponse.data || []);
            setDepartments(departmentsResponse.data || []);
        } catch (error) {
            console.error("Error loading performance templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const usedDepartmentIds = useMemo(
        () => new Set(templates.map((template) => template.departmentId)),
        [templates]
    );

    const availableDepartments = useMemo(() => {
        return departments.filter(
            (department) =>
                !usedDepartmentIds.has(department.id) ||
                department.id === editingTemplate?.departmentId
        );
    }, [departments, usedDepartmentIds, editingTemplate]);

    const canAddTemplate = availableDepartments.length > 0;

    const openAddModal = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const openEditModal = (template: PerformanceTemplate) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleSubmitTemplate = async (data: PerformanceTemplateFormData) => {
        try {
            setSaving(true);

            if (editingTemplate) {
                await performanceTemplateService.updatePerformanceTemplate(editingTemplate.id, data);
            } else {
                await performanceTemplateService.addPerformanceTemplate(data);
            }

            closeModal();
            await loadData();
        } catch (error) {
            console.error("Error saving performance template:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (template: PerformanceTemplate) => {
        setTemplateToDelete(template);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;

        try {
            setDeleting(true);
            await performanceTemplateService.deletePerformanceTemplate(templateToDelete.id);

            setIsDeleteModalOpen(false);
            setTemplateToDelete(null);
            await loadData();
        } catch (error) {
            console.error("Error deleting performance template:", error);
        } finally {
            setDeleting(false);
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates
            .filter(
                (template) =>
                    template.templateName.toLowerCase().includes(search.toLowerCase()) ||
                    template.departmentName.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.departmentName.localeCompare(b.departmentName));
    }, [templates, search]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Performance Templates</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Assign one performance review template per department</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button
                        className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                        onClick={openAddModal}
                        disabled={!canAddTemplate}
                        title={!canAddTemplate ? "Every department already has a template" : undefined}
                    >
                        <Plus size={18} /> Add Template
                    </button>
                    {!loading && !canAddTemplate && departments.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            All departments already have a template
                        </span>
                    )}
                </div>
            </div>

            {/* SEARCH */}
            <div className="relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Search
                    size={18}
                    className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="text"
                    placeholder="Search templates by name or department..."
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

            {/* CARDS GRID */}
            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && filteredTemplates.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <FileStack size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No performance templates found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            {templates.length === 0
                                ? "Add a template and link it to a department to get started."
                                : "Try adjusting your search terms."}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-slate-800
                    p-6
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    border-t-4
                    border-t-indigo-500
                    shadow-sm
                    hover:shadow-lg
                    hover:-translate-y-1
                    transition-all
                    duration-300
                    flex flex-col"
                        >
                            <span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                <Building2 size={12} />
                                {template.departmentName}
                            </span>

                            <h3 className="font-bold text-lg dark:text-white mb-2">{template.templateName}</h3>

                            <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 mb-5 line-clamp-3">
                                {template.description || "No description provided."}
                            </p>

                            <button
                                onClick={() => navigate(`/performance-templates/${template.id}/categories`)}
                                className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-lg border border-[#6C63FF]/30 text-sm font-medium text-[#6C63FF] hover:bg-[#6C63FF]/10 dark:text-indigo-400 dark:border-indigo-400/30 dark:hover:bg-indigo-500/10"
                            >
                                <LayoutGrid size={16} /> Manage Categories
                            </button>

                            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                                <button
                                    onClick={() => openEditModal(template)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(template)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddPerformanceTemplateModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitTemplate}
                loading={saving}
                editingTemplate={editingTemplate}
                availableDepartments={availableDepartments}
            />

            <DeletePerformanceTemplateModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                templateName={templateToDelete?.templateName ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default PerformanceTemplatePage;
