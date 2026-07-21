import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Filter,
    ChevronDown,
    DoorOpen,
    Users
} from 'lucide-react';

import meetingRoomService from '../services/meetingRoomService';
import floorService from '../services/floorService';
import { type MeetingRoom, type MeetingRoomFormData } from "../models/MeetingRoom";
import { type Floor } from "../models/Floor";
import AddMeetingRoomModal from '../components/modals/AddMeetingRoomModal';
import DeleteMeetingRoomModal from '../components/modals/DeleteMeetingRoomModal';
import Loader from "../components/common/Loader";

const MeetingRoomsTable: React.FC = () => {
    const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [roomToDelete, setRoomToDelete] = useState<MeetingRoom | null>(null);

    useEffect(() => {
        loadFloors();
        loadMeetingRooms();
    }, []);

    const loadFloors = async () => {
        try {
            const response = await floorService.getFloors();
            setFloors(response.data || []);
        } catch (error) {
            console.error("Error loading floors:", error);
        }
    };

    const loadMeetingRooms = async () => {
        try {
            setLoading(true);
            const response = await meetingRoomService.getMeetingRooms();
            setMeetingRooms(response.data || []);
        } catch (error) {
            console.error("Error loading meeting rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = meetingRooms.filter(room => {
        const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFloor = selectedFloorId === "" || room.floorId === selectedFloorId;
        return matchesSearch && matchesFloor;
    });

    const usedRoomNamesByFloor = useMemo(() => {
        const map: Record<string, string[]> = {};
        meetingRooms
            .filter((room) => room.id !== editingRoom?.id)
            .forEach((room) => {
                if (!map[room.floorId]) map[room.floorId] = [];
                map[room.floorId].push(room.name.toLowerCase());
            });
        return map;
    }, [meetingRooms, editingRoom]);

    const openAddModal = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const openEditModal = (room: MeetingRoom) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleSubmitRoom = async (data: MeetingRoomFormData) => {
        try {
            setSaving(true);

            if (editingRoom) {
                await meetingRoomService.updateMeetingRoom(editingRoom.id, data);
            } else {
                await meetingRoomService.addMeetingRoom(data);
            }

            closeModal();
            await loadMeetingRooms();
        } catch (error) {
            console.error("Error saving meeting room:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (room: MeetingRoom) => {
        setRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            setDeleting(true);
            await meetingRoomService.deleteMeetingRoom(roomToDelete.id);

            setIsDeleteModalOpen(false);
            setRoomToDelete(null);
            await loadMeetingRooms();
        } catch (error) {
            console.error("Error deleting meeting room:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Meeting Rooms</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage meeting rooms, their capacity and amenities</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
                    onClick={openAddModal}
                >
                    <Plus size={16} />
                    Add Meeting Room
                </button>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="flex-1 flex items-center bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150">
                    <Search size={18} className="text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search meeting rooms..."
                        className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                    />
                </div>

                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-150 min-w-[220px]">
                    <div className="pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Filter size={15} />
                    </div>
                    <select
                        value={selectedFloorId}
                        onChange={(e) => setSelectedFloorId(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300 text-sm font-medium py-2.5 pl-2.5 pr-10 cursor-pointer appearance-none z-10"
                    >
                        <option value="">All Floors</option>
                        {floors.map((floor) => (
                            <option key={floor.id} value={floor.id}>{floor.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-0">
                        <ChevronDown size={16} />
                    </div>
                </div>
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
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Room Name</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Floor</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Capacity</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Amenities</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold text-right bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="group hover:bg-slate-50/70 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{room.name}</div>
                                        {room.description && (
                                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{room.description}</div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            {room.floorName || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                            <Users size={14} className="text-slate-400 dark:text-slate-500" />
                                            {room.capacity}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {room.amenities.length === 0 ? (
                                            <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {room.amenities.map((amenity) => (
                                                    <span
                                                        key={amenity.id}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                                    >
                                                        {amenity.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-[#6C63FF] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
                                                onClick={() => openEditModal(room)}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                                                onClick={() => handleDeleteClick(room)}
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
                {!loading && filteredRooms.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <DoorOpen size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No meeting rooms found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting your search or floor filter, or add a new meeting room to get started.
                        </p>
                    </div>
                )}
            </div>

            <AddMeetingRoomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitRoom}
                loading={saving}
                editingRoom={editingRoom}
                usedRoomNamesByFloor={usedRoomNamesByFloor}
            />
            <DeleteMeetingRoomModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                roomName={roomToDelete?.name ?? ""}
                loading={deleting}
            />
        </div>
    );
};

export default MeetingRoomsTable;
