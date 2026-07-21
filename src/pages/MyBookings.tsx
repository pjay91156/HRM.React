import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Users, X, DoorOpen } from 'lucide-react';

import meetingRoomBookingService from '../services/meetingRoomBookingService';
import { type MeetingRoomBooking } from "../models/MeetingRoomBooking";
import { formatDate, formatTime, todayIso } from "../utils/datetime";
import CancelBookingModal from '../components/modals/CancelBookingModal';
import Loader from "../components/common/Loader";

type FilterTab = "upcoming" | "past" | "cancelled" | "all";

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<MeetingRoomBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<MeetingRoomBooking | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await meetingRoomBookingService.getMyBookings();
            setBookings(response.data || []);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const today = todayIso();

    const filteredBookings = useMemo(() => {
        return bookings
            .filter((booking) => {
                if (activeTab === "all") return true;
                if (activeTab === "cancelled") return booking.status === "Cancelled";
                if (activeTab === "upcoming") return booking.status === "Confirmed" && booking.bookingDate >= today;
                return booking.status === "Confirmed" && booking.bookingDate < today;
            })
            .sort((a, b) => (a.bookingDate + a.startTime).localeCompare(b.bookingDate + b.startTime));
    }, [bookings, activeTab, today]);

    const handleCancelClick = (booking: MeetingRoomBooking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        try {
            setCancelling(true);
            await meetingRoomBookingService.cancelBooking(bookingToCancel.id);
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
            await loadBookings();
        } catch (error) {
            console.error("Error cancelling booking:", error);
        } finally {
            setCancelling(false);
        }
    };

    const tabs: { id: FilterTab; label: string }[] = [
        { id: "upcoming", label: "Upcoming" },
        { id: "past", label: "Past" },
        { id: "cancelled", label: "Cancelled" },
        { id: "all", label: "All" }
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Bookings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your meeting room reservations</p>
            </div>

            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? "bg-[#6C63FF] text-white"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="relative min-h-[160px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && filteredBookings.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <CalendarClock size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No bookings here</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Bookings you make will show up in the relevant tab.
                        </p>
                    </div>
                )}

                {filteredBookings.length > 0 && (
                    <div className="space-y-3">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4"
                            >
                                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shrink-0">
                                    <DoorOpen size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{booking.meetingRoomName}</h3>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">· {booking.floorName}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            booking.status === "Confirmed"
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{booking.reason}</p>
                                    {booking.numberOfAttendees && (
                                        <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            <Users size={12} /> {booking.numberOfAttendees} attendees
                                        </p>
                                    )}
                                </div>

                                {booking.canCancel && (
                                    <button
                                        onClick={() => handleCancelClick(booking)}
                                        title="Cancel booking"
                                        className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CancelBookingModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                roomName={bookingToCancel?.meetingRoomName ?? ""}
                loading={cancelling}
            />
        </div>
    );
};

export default MyBookings;
