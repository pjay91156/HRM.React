import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Filter } from 'lucide-react';

import floorService from '../services/floorService';
import meetingRoomBookingService from '../services/meetingRoomBookingService';
import { type Floor } from "../models/Floor";
import { type MeetingRoomBooking } from "../models/MeetingRoomBooking";
import { formatDate, formatTime } from "../utils/datetime";
import Loader from "../components/common/Loader";

const inputClass = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

const BookingReport: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [bookings, setBookings] = useState<MeetingRoomBooking[]>([]);
    const [loading, setLoading] = useState(false);

    const [floorId, setFloorId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [status, setStatus] = useState<'' | 'Confirmed' | 'Cancelled'>('');

    useEffect(() => {
        floorService.getFloors().then((res) => setFloors(res.data || [])).catch(console.error);
    }, []);

    useEffect(() => {
        loadBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [floorId, fromDate, toDate, status]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await meetingRoomBookingService.getBookings({
                floorId: floorId || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                status: status || undefined
            });
            setBookings(response.data || []);
        } catch (error) {
            console.error("Error loading booking report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Booking Report</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All meeting room bookings across the organization</p>
            </div>

            {/* FILTERS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Filter size={15} /> Filters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Floor</label>
                        <select value={floorId} onChange={(e) => setFloorId(e.target.value)} className={inputClass}>
                            <option value="">All Floors</option>
                            {floors.map((floor) => (
                                <option key={floor.id} value={floor.id}>{floor.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">From</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">To</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as '' | 'Confirmed' | 'Cancelled')} className={inputClass}>
                            <option value="">All</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE */}
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
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Date</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Time</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Room</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Floor</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Booked By</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Attendees</th>
                                <th className="sticky top-0 z-30 py-3.5 px-6 font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                    <td className="py-3.5 px-6 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatDate(booking.bookingDate)}</td>
                                    <td className="py-3.5 px-6 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                    </td>
                                    <td className="py-3.5 px-6 text-sm font-medium text-slate-900 dark:text-slate-100">{booking.meetingRoomName}</td>
                                    <td className="py-3.5 px-6 text-sm text-slate-500 dark:text-slate-400">{booking.floorName}</td>
                                    <td className="py-3.5 px-6 text-sm text-slate-500 dark:text-slate-400">{booking.employeeName}</td>
                                    <td className="py-3.5 px-6 text-sm text-slate-500 dark:text-slate-400">{booking.numberOfAttendees ?? "—"}</td>
                                    <td className="py-3.5 px-6">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            booking.status === "Confirmed"
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && bookings.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                            <FileSpreadsheet size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No bookings found</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                            Try adjusting the filters above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingReport;
