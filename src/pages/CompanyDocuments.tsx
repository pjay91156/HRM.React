import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Download,
    FileText
} from 'lucide-react';

import companyDocumentService from '../services/companyDocumentService';
import { type CompanyDocument, type CompanyDocumentFormData, DOCUMENT_TYPE_OPTIONS } from "../models/CompanyDocument";
import AddCompanyDocumentModal from '../components/modals/AddCompanyDocumentModal';
import DeleteCompanyDocumentModal from '../components/modals/DeleteCompanyDocumentModal';
import Loader from "../components/common/Loader";

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CompanyDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingDocument, setEditingDocument] = useState<CompanyDocument | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<CompanyDocument | null>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await companyDocumentService.getCompanyDocuments();
            setDocuments(response.data || []);
        } catch (error) {
            console.error("Error loading company documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocuments = useMemo(
        () =>
            documents.filter((document) => {
                const matchesSearch = document.title?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = !categoryFilter || String(document.documentType) === categoryFilter;
                return matchesSearch && matchesCategory;
            }),
        [documents, searchQuery, categoryFilter]
    );

    const openAddModal = () => {
        setEditingDocument(null);
        setIsModalOpen(true);
    };

    const openEditModal = (doc: CompanyDocument) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDocument(null);
    };

    const handleSubmitDocument = async (data: CompanyDocumentFormData) => {
        try {
            setSaving(true);

            if (editingDocument) {
                await companyDocumentService.updateCompanyDocument(editingDocument.id, data);
            } else {
                await companyDocumentService.addCompanyDocument(data);
            }

            closeModal();
            await loadDocuments();
        } catch (error) {
            console.error("Error saving company document:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (doc: CompanyDocument) => {
        setDocumentToDelete(doc);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            setDeleting(true);
            await companyDocumentService.deleteCompanyDocument(documentToDelete.id);

            setIsDeleteModalOpen(false);
            setDocumentToDelete(null);
            await loadDocuments();
        } catch (error) {
            console.error("Error deleting company document:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleDownload = async (doc: CompanyDocument) => {
        try {
            await companyDocumentService.downloadCompanyDocument(doc.id, doc.fileName);
        } catch (error) {
            console.error("Error downloading company document:", error);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Company Documents</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Upload and manage company-wide policies, contracts and other documents</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
                    onClick={openAddModal}
                >
                    <Plus size={16} />
                    Upload Document
                </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                    <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-150"
                >
                    <option value="">All Categories</option>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
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
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Title</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Category</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">File</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Size</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold text-right bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredDocuments.map(doc => (
                                <tr key={doc.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{doc.title}</div>
                                        {doc.description && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.description}</div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#6C63FF]/10 text-[#6C63FF]">
                                            {doc.documentTypeName}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{doc.fileName}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(doc.fileSize)}</div>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-[#6C63FF] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
                                                onClick={() => handleDownload(doc)}
                                            >
                                                <Download size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-[#6C63FF] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
                                                onClick={() => openEditModal(doc)}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(doc)}
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
                {!loading && filteredDocuments.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No documents found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search or filters, or upload a new document to get started.
                        </p>
                    </div>
                )}
            </div>

            <AddCompanyDocumentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitDocument}
                loading={saving}
                editingDocument={editingDocument}
            />
            <DeleteCompanyDocumentModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                documentTitle={documentToDelete?.title ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default CompanyDocuments;
