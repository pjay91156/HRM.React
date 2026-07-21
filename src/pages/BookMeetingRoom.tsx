import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import { Layers3, DoorOpen, Calendar, Clock, Users, AlignLeft, CheckCircle2 } from "lucide-react";

import floorService from '../services/floorService';
import meetingRoomService from '../services/meetingRoomService';
import meetingRoomBookingService from '../services/meetingRoomBookingService';
import { type Floor } from "../models/Floor";
import { type MeetingRoom } from "../models/MeetingRoom";
import { type MeetingRoomBooking, type MeetingRoomBookingFormData } from "../models/MeetingRoomBooking";
import { formatTime, todayIso } from "../utils/datetime";
import Loader from "../components/common/Loader";

const inputClass = "w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 focus:outline-none transition-all duration-200";

const BookMeetingRoom: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [existingBookings, setExistingBookings] = useState<MeetingRoomBooking[]>([]);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<MeetingRoomBookingFormData & { floorId: string }>({
        defaultValues: {
            floorId: "",
            meetingRoomId: "",
            bookingDate: todayIso(),
            startTime: "",
            endTime: "",
            reason: "",
            numberOfAttendees: undefined
        }
    });

    const floorId = watch("floorId");
    const meetingRoomId = watch("meetingRoomId");
    const bookingDate = watch("bookingDate");

    useEffect(() => {
        floorService.getFloors().then((res) => setFloors(res.data || [])).catch(console.error);
    }, []);

    useEffect(() => {
        setValue("meetingRoomId", "");
        setRooms([]);

        if (!floorId) return;

        setLoadingRooms(true);
        meetingRoomService.getMeetingRooms(floorId)
            .then((res) => setRooms(res.data || []))
            .catch(console.error)
            .finally(() => setLoadingRooms(false));
    }, [floorId, setValue]);

    useEffect(() => {
        if (!meetingRoomId || !bookingDate) {
            setExistingBookings([]);
            return;
        }

        setLoadingExisting(true);
        meetingRoomBookingService.getBookings({
            meetingRoomId,
            fromDate: bookingDate,
            toDate: bookingDate,
            status: "Confirmed"
        })
            .then((res) => setExistingBookings(res.data || []))
            .catch(console.error)
            .finally(() => setLoadingExisting(false));
    }, [meetingRoomId, bookingDate]);

    const selectedRoom = useMemo(
        () => rooms.find((room) => room.id === meetingRoomId) ?? null,
        [rooms, meetingRoomId]
    );

    const onSubmit = async (data: MeetingRoomBookingFormData & { floorId: string }) => {
        try {
            setSubmitting(true);
            const { floorId: _floorId, ...payload } = data;
            await meetingRoomBookingService.createBooking({
                ...payload,
                numberOfAttendees: payload.numberOfAttendees || undefined
            });

            reset({
                floorId: data.floorId,
                meetingRoomId: data.meetingRoomId,
                bookingDate: data.bookingDate,
                startTime: "",
                endTime: "",
                reason: "",
                numberOfAttendees: undefined
            });
        } catch (error) {
            console.error("Error creating booking:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Book a Meeting Room</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Reserve a room for a specific date and time slot</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-5"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Floor <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Layers3 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 z-10" />
                                <select {...register("floorId", { required: "Floor is required." })} className={`${inputClass} appearance-none`}>
                                    <option value="">Select Floor</option>
                                    {floors.map((floor) => (
                                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.floorId && <p className="mt-1 text-sm text-red-500">{errors.floorId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Meeting Room <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DoorOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 z-10" />
                                <select
                                    {...register("meetingRoomId", { required: "Meeting room is required." })}
                                    disabled={!floorId || loadingRooms}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="">
                                        {!floorId ? "Select a floor first" : loadingRooms ? "Loading rooms..." : "Select Room"}
                                    </option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>{room.name} (seats {room.capacity})</option>
                                    ))}
                                </select>
                            </div>
                            {errors.meetingRoomId && <p className="mt-1 text-sm text-red-500">{errors.meetingRoomId.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                type="date"
                                min={todayIso()}
                                {...register("bookingDate", { required: "Date is required." })}
                                className={inputClass}
                            />
                        </div>
                        {errors.bookingDate && <p className="mt-1 text-sm text-red-500">{errors.bookingDate.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                                <input type="time" {...register("startTime", { required: "Start time is required." })} className={inputClass} />
                            </div>
                            {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                                <input
                                    type="time"
                                    {...register("endTime", {
                                        required: "End time is required.",
                                        validate: (value, formValues) =>
                                            !formValues.startTime || value > formValues.startTime || "End time must be after start time."
                                    })}
                                    className={inputClass}
                                />
                            </div>
                            {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Number of Attendees
                        </label>
                        <div className="relative">
                            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
                            <input
                                type="number"
                                min={1}
                                {...register("numberOfAttendees", {
                                    valueAsNumber: true,
                                    validate: (value) => {
                                        if (value === undefined || Number.isNaN(value)) return true;
                                        if (value <= 0) return "Number of attendees must be greater than 0.";
                                        if (selectedRoom && value > selectedRoom.capacity) {
                                            return `Exceeds room capacity of ${selectedRoom.capacity}.`;
                                        }
                                        return true;
                                    }
                                })}
                                placeholder={selectedRoom ? `Up to ${selectedRoom.capacity}` : "Optional"}
                                className={inputClass}
                            />
                        </div>
                        {errors.numberOfAttendees && <p className="mt-1 text-sm text-red-500">{errors.numberOfAttendees.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <AlignLeft size={16} className="absolute left-4 top-3.5 text-indigo-600" />
                            <textarea
                                rows={3}
                                {...register("reason", {
                                    validate: (value) => {
                                        const trimmed = value.trim();
                                        if (!trimmed) return "Reason is required and cannot contain only spaces.";
                                        if (trimmed.length > 500) return "Reason cannot exceed 500 characters.";
                                        return true;
                                    }
                                })}
                                placeholder="e.g. Sprint planning meeting"
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                        {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-60"
                    >
                        {submitting ? <Loader size="sm" /> : (<><CheckCircle2 size={16} /> Confirm Booking</>)}
                    </button>
                </form>

                {/* EXISTING BOOKINGS PREVIEW */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 h-fit">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Already Booked</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                        {meetingRoomId ? "Confirmed slots for this room on the selected date." : "Select a room and date to see existing bookings."}
                    </p>

                    {loadingExisting && <Loader size="md" />}

                    {!loadingExisting && meetingRoomId && existingBookings.length === 0 && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">No bookings yet — this room is free all day.</p>
                    )}

                    {!loadingExisting && existingBookings.length > 0 && (
                        <ul className="space-y-2">
                            {existingBookings.map((booking) => (
                                <li key={booking.id} className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500">{booking.employeeName}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookMeetingRoom;
