import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, ChevronDown, CalendarDays, DoorOpen } from 'lucide-react';

import floorService from '../services/floorService';
import meetingRoomBookingService from '../services/meetingRoomBookingService';
import { type Floor } from "../models/Floor";
import { type MeetingRoomBooking } from "../models/MeetingRoomBooking";
import { formatDate, formatTime, todayIso } from "../utils/datetime";
import Loader from "../components/common/Loader";

const shiftDate = (date: string, days: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};

const BookingCalendar: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [bookings, setBookings] = useState<MeetingRoomBooking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        floorService.getFloors().then((res) => setFloors(res.data || [])).catch(console.error);
    }, []);

    useEffect(() => {
        loadBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedFloorId]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await meetingRoomBookingService.getBookings({
                floorId: selectedFloorId || undefined,
                fromDate: selectedDate,
                toDate: selectedDate,
                status: "Confirmed"
            });
            setBookings(response.data || []);
        } catch (error) {
            console.error("Error loading calendar bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const bookingsByRoom = useMemo(() => {
        const map = new Map<string, { roomName: string; floorName: string; bookings: MeetingRoomBooking[] }>();

        bookings.forEach((booking) => {
            if (!map.has(booking.meetingRoomId)) {
                map.set(booking.meetingRoomId, { roomName: booking.meetingRoomName, floorName: booking.floorName, bookings: [] });
            }
            map.get(booking.meetingRoomId)!.bookings.push(booking);
        });

        return Array.from(map.values())
            .map((entry) => ({
                ...entry,
                bookings: entry.bookings.sort((a, b) => a.startTime.localeCompare(b.startTime))
            }))
            .sort((a, b) => a.roomName.localeCompare(b.roomName));
    }, [bookings]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Booking Calendar</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">See what's booked, room by room, for any day</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                        onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent outline-none text-sm font-medium text-slate-700 dark:text-slate-300 px-1"
                    />
                    <button
                        onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => setSelectedDate(todayIso())}
                        className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6C63FF] hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                    >
                        Today
                    </button>
                </div>

                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-[220px]">
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

                <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(selectedDate)}</span>
            </div>

            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
                        <Loader />
                    </div>
                )}

                {!loading && bookingsByRoom.length === 0 && (
                    <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <CalendarDays size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No bookings on this day</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            All rooms are free for the selected date and floor.
                        </p>
                    </div>
                )}

                {bookingsByRoom.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {bookingsByRoom.map((entry) => (
                            <div key={entry.roomName + entry.floorName} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                                        <DoorOpen size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{entry.roomName}</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{entry.floorName}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {entry.bookings.map((booking) => (
                                        <div key={booking.id} className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2">
                                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{booking.employeeName}</div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{booking.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCalendar;
