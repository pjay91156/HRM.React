import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import employeeService from '../services/employeeService';

interface EmployeeNodeData {
    id: string;
    employeeCode: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    isSelf: boolean;
    children: EmployeeNodeData[];
}

interface NodeProps {
    employee: EmployeeNodeData;
}

const EmployeeCardNode: React.FC<NodeProps> = ({ employee }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const hasChildren = employee.children && employee.children.length > 0;

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    const getAvatarBg = (dept?: string) => {
        const d = (dept || "").toLowerCase();
        if (d.includes('resource') || d.includes('hr')) return 'bg-blue-50 text-blue-600';
        if (d.includes('technology') || d.includes('it')) return 'bg-purple-50 text-purple-600';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="flex flex-col items-center">
            {/* CARD */}
            <div
                onClick={() => hasChildren && setIsCollapsed(!isCollapsed)}
                className={`relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all w-64 p-4 z-10 ${hasChildren ? 'cursor-pointer' : ''}`}
            >
                <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarBg(employee.department)}`}>
                        {getInitials(employee.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900 truncate">{employee.name}</span>
                            {hasChildren && (isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                        </div>
                        <span className="text-[11px] text-gray-400">{employee.employeeCode}</span>
                        <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
                            <div className="flex items-center gap-1"><Briefcase size={12} /> {employee.designation}</div>
                            <div className="flex items-center gap-1"><Mail size={12} /> {employee.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONNECTORS */}
            {/* CONNECTORS */}
            {hasChildren && !isCollapsed && (
                <div className="flex flex-col items-center">
                    {/* Parent Vertical Line */}
                    <div className="w-0.5 h-8 bg-gray-300"></div>

                    {/* The "Bridge" - Added padding to prevent overlap */}
                    <div className="w-full h-0.5 bg-gray-300"></div>

                    <div className="flex justify-center mt-0">
                        {employee.children.map((child, index) => (
                            <div key={child.id} className="relative flex flex-col items-center px-6">
                                {/* Vertical line down to the child */}
                                <div className="w-0.5 h-8 bg-gray-300"></div>
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

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 w-full overflow-auto bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-8">My Team</h1>
            {teamData ? (
                <div className="flex justify-center">
                    <EmployeeCardNode employee={teamData} />
                </div>
            ) : <div className="text-center text-gray-500">{error}</div>}
        </div>
    );
}