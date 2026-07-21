import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { DoorOpen, Users, AlignLeft, Layers3, Sparkles } from "lucide-react";
import { type MeetingRoom, type MeetingRoomFormData } from "../../models/MeetingRoom";
import { type Floor } from "../../models/Floor";
import { type MeetingRoomAmenity } from "../../models/MeetingRoomAmenity";
import floorService from "../../services/floorService";
import meetingRoomAmenityService from "../../services/meetingRoomAmenityService";
import Loader from "../common/Loader";

const emptyFormValues: MeetingRoomFormData = {
    floorId: "",
    name: "",
    capacity: 1,
    description: "",
    amenityIds: []
};

interface AddMeetingRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MeetingRoomFormData) => Promise<void>;
    loading?: boolean;
    editingRoom?: MeetingRoom | null;
    usedRoomNamesByFloor: Record<string, string[]>;
}

const AddMeetingRoomModal: React.FC<AddMeetingRoomModalProps> = ({
    isOpen,
    onClose,
    onSubmit: onSubmitRoom,
    loading = false,
    editingRoom = null,
    usedRoomNamesByFloor
}) => {
    const isEditMode = !!editingRoom;

    const [floors, setFloors] = useState<Floor[]>([]);
    const [amenities, setAmenities] = useState<MeetingRoomAmenity[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<MeetingRoomFormData>({
        defaultValues: emptyFormValues
    });

    const selectedFloorId = watch("floorId");

    useEffect(() => {
        if (!isOpen) return;

        const loadOptions = async () => {
            try {
                setLoadingOptions(true);
                const [floorsResponse, amenitiesResponse] = await Promise.all([
                    floorService.getFloors(),
                    meetingRoomAmenityService.getAmenities()
                ]);
                setFloors(floorsResponse.data || []);
                setAmenities(amenitiesResponse.data || []);
            } catch (error) {
                console.error("Failed to load floors/amenities for meeting room form", error);
            } finally {
                setLoadingOptions(false);
            }
        };

        loadOptions();

        if (editingRoom) {
            reset({
                floorId: editingRoom.floorId,
                name: editingRoom.name,
                capacity: editingRoom.capacity,
                description: editingRoom.description ?? "",
                amenityIds: editingRoom.amenities.map((a) => a.id)
            });
        } else {
            reset(emptyFormValues);
        }
    }, [isOpen, editingRoom, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: MeetingRoomFormData) => {
        await onSubmitRoom({
            ...data,
            name: data.name.trim(),
            description: data.description?.trim() || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {isEditMode ? "Edit Meeting Room" : "Add Meeting Room"}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Floor */}
                        <div>
                            <label htmlFor="floorId" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Floor <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Layers3 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 z-10" />
                                <select
                                    id="floorId"
                                    disabled={loadingOptions}
                                    {...register("floorId", { required: "Floor is required." })}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-950
                       pl-11 pr-4 py-2.5
                       text-sm text-gray-900 dark:text-white
                       focus:border-[#6C63FF]
                       focus:ring-2 focus:ring-[#6C63FF]/20
                       focus:outline-none
                       transition-all duration-200 appearance-none"
                                >
                                    <option value="">
                                        {loadingOptions ? "Loading floors..." : "Select Floor"}
                                    </option>
                                    {floors.map((floor) => (
                                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.floorId && (
                                <p className="mt-1 text-sm text-red-500">{errors.floorId.message}</p>
                            )}
                        </div>

                        {/* Room Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Room Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DoorOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                                <input
                                    id="name"
                                    {...register("name", {
                                        validate: (value) => {
                                            const trimmed = value.trim();
                                            if (!trimmed) return "Room name is required and cannot contain only spaces.";
                                            if (trimmed.length > 100) return "Room name cannot exceed 100 characters.";
                                            const usedNames = usedRoomNamesByFloor[selectedFloorId] || [];
                                            if (usedNames.includes(trimmed.toLowerCase())) {
                                                return "A meeting room with this name already exists on this floor.";
                                            }
                                            return true;
                                        }
                                    })}
                                    type="text"
                                    placeholder="e.g. Falcon"
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

                        {/* Capacity */}
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Capacity <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                                <input
                                    id="capacity"
                                    type="number"
                                    min={1}
                                    {...register("capacity", {
                                        required: "Capacity is required.",
                                        valueAsNumber: true,
                                        validate: (value) => {
                                            if (Number.isNaN(value) || value <= 0) return "Capacity must be greater than 0.";
                                            return true;
                                        }
                                    })}
                                    className="w-full rounded-lg border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-950
                         pl-11 pr-4 py-2.5
                         text-sm text-gray-900 dark:text-white
                         focus:border-[#6C63FF]
                         focus:ring-2 focus:ring-[#6C63FF]/20
                         focus:outline-none
                         transition-all duration-200"
                                />
                            </div>
                            {errors.capacity && (
                                <p className="mt-1 text-sm text-red-500">{errors.capacity.message}</p>
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
                                    placeholder="Optional notes about this room"
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

                        {/* Amenities */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                <Sparkles size={14} className="text-indigo-600" /> Amenities
                            </label>
                            {loadingOptions ? (
                                <p className="text-xs text-gray-400 dark:text-slate-500">Loading amenities...</p>
                            ) : amenities.length === 0 ? (
                                <p className="text-xs text-gray-400 dark:text-slate-500">No amenities available yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 p-3 max-h-40 overflow-y-auto">
                                    {amenities.map((amenity) => (
                                        <label key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={amenity.id}
                                                {...register("amenityIds")}
                                                className="rounded border-gray-300 dark:border-slate-600 text-[#6C63FF] focus:ring-[#6C63FF]/30"
                                            />
                                            {amenity.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
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
                            disabled={loading || loadingOptions}
                            className="px-5 py-2.5 text-sm font-medium rounded-lg
                   bg-[#6C63FF] text-white
                   hover:bg-[#5B52F5]
                   focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30
                   transition-all duration-200 disabled:opacity-50
                   min-w-[110px] flex items-center justify-center"
                        >
                            {loading ? <Loader size="sm" /> : isEditMode ? "Update Room" : "Save Room"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMeetingRoomModal;
