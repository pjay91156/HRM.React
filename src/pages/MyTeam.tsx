import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Briefcase, AlertCircle, ChevronDown, ChevronUp, Users } from 'lucide-react';
import employeeService from '../services/employeeService';
import Loader from '../components/common/Loader';
import { getMediaUrl } from '../utils/media';

interface EmployeeNodeData {
    id: string;
    employeeCode: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    isSelf: boolean;
    profilePictureUrl: string | null;
    children: EmployeeNodeData[];
}

interface NodeProps {
    employee: EmployeeNodeData;
}

const DEPARTMENT_STYLES: Record<string, { avatar: string; ring: string; accent: string }> = {
    hr: { avatar: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white', ring: 'ring-blue-100', accent: 'bg-blue-500' },
    it: { avatar: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white', ring: 'ring-purple-100', accent: 'bg-purple-500' },
    default: { avatar: 'bg-gradient-to-br from-slate-500 to-slate-600 text-white', ring: 'ring-slate-100', accent: 'bg-slate-400' },
};

const getDepartmentStyle = (dept?: string) => {
    const d = (dept || '').toLowerCase();
    if (d.includes('resource') || d.includes('hr')) return DEPARTMENT_STYLES.hr;
    if (d.includes('technology') || d.includes('it')) return DEPARTMENT_STYLES.it;
    return DEPARTMENT_STYLES.default;
};

const getInitials = (name: string) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

const countMembers = (node: EmployeeNodeData): number =>
    1 + node.children.reduce((sum, child) => sum + countMembers(child), 0);

const EmployeeCardNode: React.FC<NodeProps> = ({ employee }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const hasChildren = employee.children && employee.children.length > 0;
    const style = getDepartmentStyle(employee.department);
    const pictureSrc = getMediaUrl(employee.profilePictureUrl);

    return (
        <div className="flex flex-col items-center">
            {/* CARD */}
            <div
                onClick={() => hasChildren && setIsCollapsed(!isCollapsed)}
                className={`group relative w-52 rounded-2xl border bg-white dark:bg-slate-900 p-3 shadow-sm transition-all z-10 ${
                    hasChildren ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'hover:shadow-md'
                } ${employee.isSelf ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-200 dark:border-slate-700'}`}
            >
                <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${style.accent}`} />

                <div className="flex items-start gap-2.5">
                    {pictureSrc ? (
                        <img
                            src={pictureSrc}
                            alt={employee.name}
                            className={`h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-4 ${style.ring}`}
                        />
                    ) : (
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ${style.avatar} ${style.ring}`}>
                            {getInitials(employee.name)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-1.5">
                            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{employee.name}</span>
                            {hasChildren && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCollapsed(!isCollapsed);
                                    }}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                    title={isCollapsed ? 'Expand team' : 'Collapse team'}
                                >
                                    {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                                </button>
                            )}
                        </div>
                        {employee.isSelf && (
                            <span className="mt-0.5 inline-block rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                                You
                            </span>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{employee.employeeCode}</div>
                        <div className="mt-1.5 space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 truncate">
                                <Briefcase size={11} className="shrink-0 text-slate-400 dark:text-slate-500" /> <span className="truncate">{employee.designation}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                                <Mail size={11} className="shrink-0 text-slate-400 dark:text-slate-500" /> <span className="truncate">{employee.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {hasChildren && (
                    <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        <Users size={11} />
                        {employee.children.length} direct report{employee.children.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* CONNECTORS */}
            {hasChildren && !isCollapsed && (
                <div className="flex flex-col items-center">
                    {/* Parent Vertical Line */}
                    <div className="h-6 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200"></div>

                    {/* The "Bridge" */}
                    <div className="h-0.5 w-full bg-slate-200"></div>

                    <div className="mt-0 flex justify-center">
                        {employee.children.map((child) => (
                            <div key={child.id} className="relative flex flex-col items-center px-2">
                                {/* Vertical line down to the child */}
                                <div className="h-6 w-0.5 bg-slate-200"></div>
                                <EmployeeCardNode employee={child} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function MyTeam() {
    const [teamData, setTeamData] = useState<EmployeeNodeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        employeeService.getMyTeamHierarchy().then(res => {
            if (res?.success) setTeamData(res.data);
            else setError(res?.message || "Error loading team");
            setLoading(false);
        }).catch(() => { setError("Connection failed"); setLoading(false); });
    }, []);

    const totalMembers = useMemo(() => (teamData ? countMembers(teamData) : 0), [teamData]);

    if (loading) return <div className="flex justify-center p-20"><Loader /></div>;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Team</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View your reporting hierarchy and team details</p>
                </div>

                {teamData && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 shadow-sm">
                        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-2 text-indigo-600">
                            <Users size={18} />
                        </div>
                        <div>
                            <div className="text-lg font-bold leading-none text-slate-900 dark:text-slate-100">{totalMembers}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">Team member{totalMembers === 1 ? '' : 's'}</div>
                        </div>
                    </div>
                )}
            </div>

            {teamData ? (
                <div className="w-full overflow-x-auto pb-4">
                    <div className="flex min-w-max justify-center">
                        <EmployeeCardNode employee={teamData} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle size={28} className="text-rose-400" />
                    {error || 'Unable to load your team.'}
                </div>
            )}
        </div>
    );
}