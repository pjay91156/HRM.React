import React, { useState } from 'react';
import { useNavigate, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Building2,
    ChevronLeft,
    ChevronDown,
    LogOut,
    Briefcase,
    CalendarRange,
    Clock
} from 'lucide-react';

const Layout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');
    const [isEmployeesOpen, setIsEmployeesOpen] = useState<boolean>(false);
    const [isLeaveOpen, setIsLeaveOpen] = useState<boolean>(false);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex font-sans antialiased text-gray-900">

            {/* Sidebar */}
            <aside className={`${isCollapsed ? 'w-[76px]' : 'w-[240px]'} bg-white border-r border-gray-200 fixed inset-y-0 left-0 flex flex-col z-10 transition-all duration-200`}>

                <div className="flex-1 min-h-0 flex flex-col">

                    {/* Logo */}
                    <div className={`h-20 px-6 flex items-center border-b border-gray-100 ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
                        {!isCollapsed && (
                            <span className="text-xl font-bold">
                                HRM System
                            </span>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <ChevronLeft
                                size={18}
                                className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">

                        {[
                            {
                                id: 'Dashboard',
                                label: 'Dashboard',
                                path: '/dashboard',
                                icon: <LayoutDashboard size={18} />
                            },

                            {
                                id: 'Employees',
                                label: 'Employees',
                                icon: <Users size={18} />,
                                hasSubmenu: true,
                                subItems: [
                                    {
                                        id: 'AllEmployees',
                                        label: 'All Employees',
                                        path: '/employees'
                                    },
                                    {
                                        id: 'MyTeam',
                                        label: 'My Team',
                                        path: '/myteam'
                                    }
                                ]
                            },

                            {
                                id: 'LeaveManagement',
                                label: 'Leave Management',
                                icon: <CalendarRange size={18} />,
                                hasSubmenu: true,
                                subItems: [
                                    {
                                        id: 'LeaveTypes',
                                        label: 'Leave Types',
                                        path: '/leave-types'
                                    },
                                    {
                                        id: 'ApplyLeave',
                                        label: 'Apply Leave',
                                        path: '/leave-request'
                                    },
                                    {
                                        id: 'MyLeaves',
                                        label: 'My Leaves',
                                        path: '/my-leaves'
                                    },
                                    {
                                        id: 'TeamLeaves',
                                        label: 'Team Leaves',
                                        path: '/team-leaves'
                                    },
                                    {
                                        id: 'LeaveCalendar',
                                        label: 'Leave Calendar',
                                        path: '/team-leave-calendar'
                                    }
                                ]
                            },

                            {
                                id: 'Attendance',
                                label: 'Attendance',
                                icon: <Clock size={18} />,
                                hasSubmenu: true,
                                subItems: [
                                    {
                                        id: 'MyAttendance',
                                        label: 'My Attendance',
                                        path: '/my-attendance'
                                    },
                                    {
                                        id: 'TeamAttendance',
                                        label: 'Team Attendance',
                                        path: '/team-attendance'
                                    },
                                    {
                                        id: 'RegularizeAttendance',
                                        label: 'Regularize Attendance',
                                        path: '/regularize-attendance'
                                    },
                                    {
                                        id: 'TeamRegularizeAttendanceRequests',
                                        label: 'Team Regularize Attendance Requests',
                                        path: '/team-regularize-attendance-requests'
                                    }
                                ]
                            },

                            {
                                id: 'Departments',
                                label: 'Departments',
                                path: '/departments',
                                icon: <Building2 size={18} />
                            },

                            {
                                id: 'Designations',
                                label: 'Designations',
                                path: '/designations',
                                icon: <Briefcase size={18} />
                            }

                        ].map((item) => {

                            if (!item.hasSubmenu) {

                                const isActive =
                                    activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            navigate(item.path!);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                                            isCollapsed ? 'justify-center' : ''
                                        } ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        {item.icon}
                                        {!isCollapsed && item.label}
                                    </button>
                                );
                            }

                            const isOpen =
                                item.id === 'Employees'
                                    ? isEmployeesOpen
                                    : item.id === 'LeaveManagement'
                                    ? isLeaveOpen
                                    : isAttendanceOpen;

                            const toggleOpen = () => {

                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                }

                                if (item.id === 'Employees') {
                                    setIsEmployeesOpen(
                                        !isEmployeesOpen
                                    );
                                }

                                else if (
                                    item.id === 'LeaveManagement'
                                ) {
                                    setIsLeaveOpen(
                                        !isLeaveOpen
                                    );
                                }

                                else if (
                                    item.id === 'Attendance'
                                ) {
                                    setIsAttendanceOpen(
                                        !isAttendanceOpen
                                    );
                                }
                            };

                            return (
                                <div
                                    key={item.id}
                                    className="space-y-1"
                                >
                                    <button
                                        onClick={toggleOpen}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm transition-colors ${
                                            isCollapsed ? 'justify-center' : 'justify-between'
                                        } ${
                                            activeTab.includes(item.id)
                                                ? 'bg-gray-50/60 text-slate-900 font-medium'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            {!isCollapsed && item.label}
                                        </div>

                                        {!isCollapsed && (
                                            <ChevronDown
                                                size={16}
                                                className={`text-gray-400 transition-transform ${
                                                    isOpen
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {!isCollapsed && isOpen && (
                                        <div className="ml-6 pl-3 border-l border-gray-100 space-y-1">

                                            {item.subItems?.map(
                                                (subItem) => (
                                                    <button
                                                        key={subItem.id}
                                                        onClick={() => {
                                                            setActiveTab(
                                                                subItem.id
                                                            );
                                                            navigate(
                                                                subItem.path
                                                            );
                                                        }}
                                                        className={`w-full text-left block px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                                                            activeTab ===
                                                            subItem.id
                                                                ? 'text-blue-600 font-semibold bg-blue-50/40'
                                                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50/50'
                                                        }`}
                                                    >
                                                        {
                                                            subItem.label
                                                        }
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        className={`w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors ${
                            isCollapsed ? 'justify-center' : ''
                        }`}
                        onClick={handleLogout}
                        title={isCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className={`flex-1 min-w-0 transition-all duration-200 ${isCollapsed ? 'pl-[76px]' : 'pl-[240px]'}`}>
                <main className="p-8 max-w-[1400px] mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;