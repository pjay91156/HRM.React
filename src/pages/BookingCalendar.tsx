import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, ChevronDown, CalendarDays, DoorOpen, Clock3 } from 'lucide-react';

import floorService from '../services/floorService';
import meetingRoomBookingService from '../services/meetingRoomBookingService';
import { type Floor } from "../models/Floor";
import { type MeetingRoomBooking } from "../models/MeetingRoomBooking";
import { formatDate, formatTime, todayIso } from "../utils/datetime";
import Loader from "../components/common/Loader";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../css/BookingCalendar.css"
import * as Tooltip from "@radix-ui/react-tooltip";


import {
    format,
    parse,
    startOfWeek,
    getDay
} from "date-fns";

import { enUS } from "date-fns/locale";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const shiftDate = (date: string, days: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + days);
    return format(d, "yyyy-MM-dd");
};

const BookingCalendar: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [bookings, setBookings] = useState<MeetingRoomBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const calendarViews = [
        { label: "Day", value: Views.DAY },
        { label: "Week", value: Views.WEEK },
        { label: "Month", value: Views.MONTH },
    ];
    const [view, setView] = useState<View>(Views.DAY);
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
    const roomPalette = [
        "#6366F1",
        "#10B981",
        "#F59E0B",
        "#EC4899",
        "#06B6D4",
        "#8B5CF6",
        "#EF4444",
        "#14B8A6",
    ];
    const getRoomColor = (roomId: string) => {
        let hash = 0;

        for (let i = 0; i < roomId.length; i++) {
            hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
        }

        return roomPalette[Math.abs(hash) % roomPalette.length];
    };
    const events = useMemo<CalendarEvent[]>(() => {

        return bookings.map((booking) => {

            const start = new Date(
                `${booking.bookingDate}T${booking.startTime}`
            );

            const end = new Date(
                `${booking.bookingDate}T${booking.endTime}`
            );

            return {
                id: booking.id,

                // Display the reason. If empty, show room name.
                title: booking.reason?.trim() || booking.meetingRoomName,

                start,
                end,
                meetingRoomId: booking.meetingRoomId,
                employee: booking.employeeName,
                room: booking.meetingRoomName,
                attendees: booking.numberOfAttendees,
                status: booking.status,
                canCancel: booking.canCancel
            };

        });

    }, [bookings]);
    const currentDate = new Date(`${selectedDate}T00:00:00`);
    type CalendarEvent = {
        id: string;
        title: string;
        start: Date;
        end: Date;
        employee: string;
        room: string;
        attendees: number | null;
        status: string;
        canCancel: boolean;
        meetingRoomId: string;
    };

    const EventCard = ({ event }: { event: CalendarEvent }) => {
        const color = getRoomColor(event.meetingRoomId);
        return (
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <div className="h-full flex flex-col justify-center px-2 py-1 text-white cursor-pointer">

                        {/* Only display these in the calendar */}
                        <span className="text-xs font-semibold truncate">
                            {event.title}
                        </span>

                    </div>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                    <Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={10}
                        className="z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
                        style={{
                            border: `2px solid ${color}`
                        }}
                    >
                        {/* Full details only in the tooltip */}
                        <div className="space-y-4 text-slate-800">
                            <h3 className="text-base font-semibold border-b border-slate-200 pb-2">
                                {event.title}
                            </h3>

                            <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">

                                <span className="font-semibold text-slate-700">
                                    Booked By
                                </span>
                                <span className="text-slate-600">
                                    {event.employee}
                                </span>

                                <span className="font-semibold text-slate-700">
                                    Meeting Room
                                </span>
                                <span className="text-slate-600">
                                    {event.room}
                                </span>

                                <span className="font-semibold text-slate-700">
                                    Time
                                </span>
                                <span className="text-slate-600">
                                    {format(event.start, "hh:mm a")} - {format(event.end, "hh:mm a")}
                                </span>

                            </div>
                        </div>
                        {/* <Tooltip.Arrow
                            width={18}
                            height={10}
                            style={{
                                fill: "white",
                            }}
                        /> */}
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        );
    };
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
                    {/* <div className="pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Filter size={15} />
                    </div> */}
                    <select
                        value={selectedFloorId}
                        onChange={(e) => setSelectedFloorId(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300 text-sm font-medium py-2.5 pl-2.5 pr-10 cursor-pointer appearance-none z-10"
                    >
                        <option value="">All</option>
                        {floors.map((floor) => (
                            <option key={floor.id} value={floor.id}>{floor.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-0">
                        <ChevronDown size={16} />
                    </div>
                </div>


            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm mb-4">
                    {calendarViews.map((item, index) => (
                        <button
                            key={item.value}
                            onClick={() => setView(item.value)}
                            className={`
                px-5 py-2 text-sm font-medium transition-colors
                ${view === item.value
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                }
                ${index !== calendarViews.length - 1 ? "border-r border-slate-200" : ""}
            `}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <Tooltip.Provider delayDuration={200}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        date={currentDate}
                        view={view}
                        views={[Views.DAY, Views.WEEK, Views.MONTH]}
                        onView={(newView) => setView(newView)}
                        toolbar={false}
                        selectable
                        step={30}
                        timeslots={2}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: getRoomColor(event.meetingRoomId),


                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                            },
                        })}
                        formats={{
                            eventTimeRangeFormat: () => "",
                        }}
                        components={{
                            event: EventCard
                        }}
                        min={
                            new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate(),
                                8,
                                0
                            )
                        }
                        max={
                            new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate(),
                                19,
                                0
                            )
                        }
                        onNavigate={(date) =>
                            setSelectedDate(format(date, "yyyy-MM-dd"))
                        }
                        style={{
                            height: 750
                        }}
                    />
                </Tooltip.Provider>
            </div>

        </div>
    );
};

export default BookingCalendar;
