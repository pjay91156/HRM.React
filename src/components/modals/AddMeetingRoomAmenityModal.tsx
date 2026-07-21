import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Sparkles, AlignLeft } from "lucide-react";
import { type MeetingRoomAmenity, type MeetingRoomAmenityFormData } from "../../models/MeetingRoomAmenity";
import Loader from "../common/Loader";

const emptyFormValues: MeetingRoomAmenityFormData = {
    name: "",
    description: ""
};

interface AddMeetingRoomAmenityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MeetingRoomAmenityFormData) => Promise<void>;
    loading?: boolean;
    editingAmenity?: MeetingRoomAmenity | null;
    usedAmenityNames: string[];
}

const AddMeetingRoomAmenityModal: React.FC<AddMeetingRoomAmenityModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitAmenity,
    loading = false,
    editingAmenity = null,
    usedAmenityNames
}) => {
    const isEditMode = !!editingAmenity;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MeetingRoomAmenityFormData>({
        defaultValues: emptyFormValues
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingAmenity) {
            reset({
                name: editingAmenity.name,
                description: editingAmenity.description ?? ""
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingAmenity, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: MeetingRoomAmenityFormData) => {
        await onSubmitAmenity({
            name: data.name.trim(),
            description: data.description?.trim() || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Amenity" : "Add Amenity"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Amenity Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Amenity Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                id="name"
                                {...register("name", {
                                    validate: (value) => {
                                        const trimmed = value.trim();
                                        if (!trimmed) return "Amenity name is required and cannot contain only spaces.";
                                        if (trimmed.length > 100) return "Amenity name cannot exceed 100 characters.";
                                        if (usedAmenityNames.includes(trimmed.toLowerCase())) {
                                            return "An amenity with this name already exists.";
                                        }
                                        return true;
                                    }
                                })}
                                type="text"
                                placeholder="e.g. Projector"
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       pl-11 pr-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       placeholder:text-gray-400
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <AlignLeft size={16} className="absolute left-4 top-3.5 text-indigo-600" />
                            <textarea
                                id="description"
                                rows={3}
                                {...register("description", {
                                    validate: (value) => {
                                        if (value && value.trim().length > 500) {
                                            return "Description cannot exceed 500 characters.";
                                        }
                                        return true;
                                    }
                                })}
                                placeholder="Optional notes about this amenity"
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-950
                         pl-11 pr-4 py-2.5
                         text-sm text-gray-900 dark:text-white
                         placeholder:text-gray-400
                         focus:border-[#6C63FF]
                         focus:ring-2 focus:ring-[#6C63FF]/20
                         focus:outline-none
                         transition-all duration-200 resize-none"
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600
                   bg-white dark:bg-slate-800
                   text-gray-700 dark:text-slate-300
                   hover:bg-gray-100 dark:hover:bg-slate-700
                   transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg
                   bg-[#6C63FF] text-white
                   hover:bg-[#5B52F5]
                   focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30
                   transition-all duration-200 disabled:opacity-50
                   min-w-[110px] flex items-center justify-center"
                        >
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Amenity" : "Save Amenity"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMeetingRoomAmenityModal;
