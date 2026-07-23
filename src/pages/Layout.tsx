import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
    LayoutDashboard, Users, Building2, ChevronDown, LogOut, Briefcase,
    CalendarRange, Clock, Menu, Bell, Sun, Moon, User, Lock, Settings, TrendingUp,
    FileSpreadsheet,
    DoorOpen,
    Layers3,
    Package,
    CalendarClock,
    CalendarDays,
    ClipboardList,
    FileText,
} from "lucide-react";

import hrmLogo from "../assets/images/HRM.png";
import { useTheme } from "../context/ThemeContext";
import { type NotificationItem } from "../models/Notification";
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notificationService";
import { logout } from "../services/authService";
import profileService from "../services/profileService";
import { type MyProfile } from "../models/Profile";
import MyProfileModal from "../components/modals/MyProfileModal";
import { getMediaUrl } from "../utils/media";

interface NavSubItem {
    id: string;
    label: string;
    path: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: NavSubItem[];
}

const NAV_ITEMS: NavItem[] = [
    { id: "Dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    {
        id: "Employees",
        label: "Employees",
        icon: <Users size={18} />,
        subItems: [
            { id: "AllEmployees", label: "All Employees", path: "/employees" },
            { id: "MyTeam", label: "My Team", path: "/myteam" },
        ],
    },
    {
        id: "LeaveManagement",
        label: "Leave Management",
        icon: <CalendarRange size={18} />,
        subItems: [
            { id: "LeaveTypes", label: "Leave Types", path: "/leave-types" },
            { id: "ApplyLeave", label: "Apply Leave", path: "/leave-request" },
            { id: "MyLeaves", label: "My Leaves", path: "/my-leaves" },
            { id: "TeamLeaves", label: "Team Leaves", path: "/team-leaves" },
            { id: "LeaveCalendar", label: "Leave Calendar", path: "/team-leave-calendar" },
        ],
    },
    {
        id: "Attendance",
        label: "Attendance",
        icon: <Clock size={18} />,
        subItems: [
            { id: "MyAttendance", label: "My Attendance", path: "/my-attendance" },
            { id: "TeamAttendance", label: "Team Attendance", path: "/team-attendance" },
            { id: "RegularizeAttendance", label: "Regularize Attendance", path: "/regularize-attendance" },
            { id: "TeamRegularizeAttendanceRequests", label: "Team Regularize Attendance Requests", path: "/team-regularize-attendance-requests" },
        ],
    },
    {
        id: "PerformanceManagement", label: "Performance", icon: <TrendingUp size={18} />,
        subItems: [
            { id: "Performance Cycle", label: "Performance Cycle", path: "/performance-cycles" },
            { id: "Performance Rating", label: "Performance Rating", path: "/performance-ratings" },
            { id: "Performance Template", label: "Performance Template", path: "/performance-templates" },
            { id: "Review", label: " Review", path: "/review" },
            { id: "MyTeamReview", label: "My Team Review", path: "/my-team-review" },

        ],
    },
    {
        id: "MeetingRoomManagement",
        label: "Meeting Rooms",
        icon: <DoorOpen size={18} />,
        subItems: [
            {
                id: "Floors",
                label: "Floors",
                path: "/meeting-room/floors",
            },
            {
                id: "Amenities",
                label: "Amenities",
                path: "/meeting-room/amenities",
            },
            {
                id: "MeetingRooms",
                label: "Meeting Rooms",
                path: "/meeting-room/rooms",
            },
            {
                id: "BookMeetingRoom",
                label: "Book Meeting Room",
                path: "/meeting-room/book",
            },
            {
                id: "MyBookings",
                label: "My Bookings",
                path: "/meeting-room/my-bookings",
            },
            {
                id: "BookingCalendar",
                label: "Booking Calendar",
                path: "/meeting-room/calendar",
            },
            {
                id: "BookingReport",
                label: "Booking Report",
                path: "/meeting-room/report",
            },
        ],
    },
    { id: "Departments", label: "Departments", path: "/departments", icon: <Building2 size={18} /> },
    { id: "Designations", label: "Designations", path: "/designations", icon: <Briefcase size={18} /> },
    { id: "Reports", label: "Reports", path: "/reports", icon: <FileSpreadsheet size={18} /> },
    { id: "CompanyDocuments", label: "Company Documents", path: "/company-documents", icon: <FileText size={18} /> },
];

const findActiveSection = (pathname: string) => {
    for (const item of NAV_ITEMS) {
        if (item.path === pathname) {
            return { parent: null as NavItem | null, current: item as NavItem | NavSubItem };
        }
        const sub = item.subItems?.find((s) => s.path === pathname);
        if (sub) {
            return { parent: item, current: sub };
        }
    }
    return { parent: null, current: null };
};

const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Layout: React.FC = () => {
    // const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);
    // const [isLeaveOpen, setIsLeaveOpen] = useState(false);
    // const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    // const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profile, setProfile] = useState<MyProfile | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const { parent, current } = findActiveSection(location.pathname);

    const loadNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error(error);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await profileService.getMyProfile();
            if (response.success) {
                setProfile(response.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 45000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useLayoutEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto", // or "smooth"
        });
    }, [location.pathname]);

    const handleNotificationClick = async (notification: NotificationItem) => {
        setIsNotifOpen(false);

        if (!notification.isRead) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            try {
                await markNotificationAsRead(notification.id);
            } catch (error) {
                console.error(error);
            }
        }

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (parent?.id) {
            setOpenMenu(parent.id);
        }
    }, [parent?.id]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const profileName = profile ? `${profile.firstName} ${profile.lastName}` : "";
    const profileDesignation = profile?.designationName ?? "";
    const profileInitials = profile
        ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
        : "";
    const profilePictureSrc = getMediaUrl(profile?.profilePictureUrl);
    // const [isMeetingRoomOpen, setIsMeetingRoomOpen] = useState(false);

    // const openSectionState: Record<string, [boolean, (v: boolean) => void]> = {
    //     Employees: [isEmployeesOpen, setIsEmployeesOpen],
    //     LeaveManagement: [isLeaveOpen, setIsLeaveOpen],
    //     Attendance: [isAttendanceOpen, setIsAttendanceOpen],
    //     PerformanceManagement: [isPerformanceOpen, setIsPerformanceOpen],
    //     MeetingRoomManagement: [isMeetingRoomOpen, setIsMeetingRoomOpen],
    // };

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        contentRef.current?.scrollTo({
            top: 0,
            behavior: "auto", // or "smooth"
        });
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 font-sans antialiased text-gray-900 dark:text-slate-100">

            {/* Top Bar */}
            <header className="h-16 shrink-0 bg-[#6C63FF] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-35 shadow-md">
                <div className="flex items-center gap-2">
                    <img src={hrmLogo} alt="HRM" className="h-10 w-auto object-contain" />
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Menu size={22} strokeWidth={2.2} />
                    </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            title="Notifications"
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#6C63FF]">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute top-14 right-0 w-80 max-h-[420px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-slate-800">
                                    <p className="font-semibold text-gray-800 dark:text-slate-100">Notifications</p>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs font-medium text-[#6C63FF] hover:underline dark:text-indigo-400"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-slate-500">
                                            <Bell size={22} />
                                            <span className="text-sm">You're all caught up</span>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-slate-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${notification.isRead ? "" : "bg-indigo-50/50 dark:bg-indigo-500/5"
                                                    }`}
                                            >
                                                <span
                                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-transparent" : "bg-[#6C63FF]"
                                                        }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm truncate ${notification.isRead ? "text-gray-600 dark:text-slate-300" : "font-semibold text-gray-900 dark:text-slate-100"}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>



                    <div className="w-px h-8 bg-white/20 mx-1" />

                    {/* User Avatar & Dropdown Trigger */}
                    <button
                        type="button"
                        className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        {profilePictureSrc ? (
                            <img src={profilePictureSrc} alt={profileName} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-white text-[#6C63FF] flex items-center justify-center font-bold text-sm shadow-sm">
                                {profileInitials}
                            </div>
                        )}
                        <div className="text-sm text-left hidden sm:block">
                            <p className="font-semibold text-white leading-tight">{profileName}</p>
                            <p className="text-xs text-indigo-100 leading-tight">{profileDesignation}</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-indigo-100 hidden sm:block transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="relative px-4 py-4 bg-gradient-to-br from-[#6C63FF]/10 via-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:via-slate-900 dark:to-purple-500/10">
                                <div className="flex items-center gap-3">
                                    {profilePictureSrc ? (
                                        <img src={profilePictureSrc} alt={profileName} className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-900" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                                            {profileInitials}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">{profileName}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{profileDesignation}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="py-2">
                                {[
                                    { icon: <User size={16} />, label: "My Profile", onClick: () => { setIsProfileOpen(false); setIsProfileModalOpen(true); } },
                                    { icon: <Lock size={16} />, label: "Change Password", onClick: undefined },
                                ].map((menuItem, i) => (
                                    <button
                                        key={i}
                                        onClick={menuItem.onClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 transition-colors"
                                    >
                                        <span className="text-gray-400 dark:text-slate-500">{menuItem.icon}</span>
                                        {menuItem.label}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-gray-50 dark:border-slate-800 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm text-red-500 transition-colors"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1 min-h-0">

                {/* Sidebar */}
                <aside className={`${isCollapsed ? "w-[76px]" : "w-[240px]"} shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-all duration-200`}>

                    {/* Menu */}
                    <nav className="min-h-0 overflow-y-auto p-3 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            if (!item.subItems) {
                                const isActive = current?.id === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path!)}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isCollapsed ? "justify-center" : ""} ${isActive
                                            ? "bg-[#6C63FF] text-white font-semibold shadow-sm"
                                            : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        {item.icon}
                                        {!isCollapsed && item.label}
                                    </button>
                                );
                            }

                            const isOpen = openMenu === item.id;
                            const isSectionActive = parent?.id === item.id;

                            const toggleOpen = () => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                }

                                setOpenMenu(prev => prev === item.id ? null : item.id);
                            };

                            return (
                                <div key={item.id} className="space-y-1">
                                    <button
                                        onClick={toggleOpen}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors ${isCollapsed ? "justify-center" : "justify-between"} ${isSectionActive
                                            ? "bg-[#6C63FF] text-white font-medium shadow-sm"
                                            : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            {!isCollapsed && item.label}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform ${isOpen ? "rotate-180" : ""} ${isSectionActive ? "text-white" : "text-gray-400 dark:text-slate-500"
                                                    }`}
                                            />
                                        )}
                                    </button>

                                    {!isCollapsed && isOpen && (
                                        <div className="ml-3 pl-2 border-l border-gray-100 dark:border-slate-800 space-y-1">
                                            {item.subItems.map((subItem) => {
                                                const isSubActive = current?.id === subItem.id;
                                                return (
                                                    <button
                                                        key={subItem.id}
                                                        onClick={() => navigate(subItem.path)}
                                                        className={`w-full text-left block px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${isSubActive
                                                            ? "text-indigo-600 font-semibold bg-indigo-50/60 dark:text-indigo-400 dark:bg-indigo-500/10"
                                                            : "text-gray-400 hover:text-gray-900 hover:bg-gray-50/50 dark:text-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    {/* <div className="p-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors ${isCollapsed ? "justify-center" : ""}`}
                            onClick={handleLogout}
                            title={isCollapsed ? "Logout" : undefined}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && "Logout"}
                        </button>
                    </div> */}
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0 overflow-y-auto" ref={contentRef}>
                    <main className="p-8 max-w-[1400px] w-full mx-auto">
                        <Outlet />
                    </main>
                </div>
            </div>

            <MyProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onUpdated={(updated) => setProfile(updated)}
            />
        </div>
    );
};

export default Layout;
