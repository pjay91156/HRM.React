import { useEffect, useMemo, useState } from "react";
import { X, Trash2, CalendarDays, Plus } from "lucide-react";
import { type AttendanceSessionsResponse, type SessionChange, type RegularizationRequest } from "../../models/RegularizeAttendance";
import { submitRegularizationRequest } from "../../services/regularizeAttendanceService";

interface AttendanceRegularizationModalProps {
    isOpen: boolean;
    attendanceDate: string;
    attendanceData: AttendanceSessionsResponse | null;
    onClose: () => void;
}

const formatTime = (dateTime?: string | null) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatWorkingHours = (hours?: number) => {
    if (!hours) return "00h 00m";
    const totalMinutes = Math.round(hours * 60);
    return `${Math.floor(totalMinutes / 60).toString().padStart(2, "0")}h ${(totalMinutes % 60).toString().padStart(2, "0")}m`;
};
const calculateWorkingHours = (
    checkIn: string,
    checkOut: string
) => {

    if (!checkIn || !checkOut)
        return 0;

    const start = new Date(`2000-01-01T${checkIn}:00`);

    const end = new Date(`2000-01-01T${checkOut}:00`);

    const diff = end.getTime() - start.getTime();

    if (diff <= 0)
        return 0;

    return diff / (1000 * 60 * 60);

};
const validateAllSessions = (allSessions: any): string => {

    for (const current of allSessions) {

        // Skip incomplete new sessions while user is typing
        if (!current.checkIn && !current.checkOut)
            continue;

        if (!current.checkIn)
            return `Session ${current.sessionNumber}: Check In is required.`;

        if (!current.checkOut)
            return `Session ${current.sessionNumber}: Check Out is required.`;

        const currentStart = new Date(`2000-01-01T${current.checkIn}:00`);
        const currentEnd = new Date(`2000-01-01T${current.checkOut}:00`);

        if (currentEnd <= currentStart)
            return `Session ${current.sessionNumber}: Check Out must be greater than Check In.`;

        for (const other of allSessions) {

            if (current.sessionId === other.sessionId)
                continue;

            if (!other.checkIn || !other.checkOut)
                continue;

            const otherStart = new Date(`2000-01-01T${other.checkIn}:00`);
            const otherEnd = new Date(`2000-01-01T${other.checkOut}:00`);

            const isOverlap =
                currentStart < otherEnd &&
                currentEnd > otherStart;

            if (isOverlap) {

                return `Session ${current.sessionNumber} overlaps with Session ${other.sessionNumber}.`;

            }
        }
    }

    return "";
};


export default function AttendanceRegularizationModal({
    isOpen,
    attendanceDate,
    attendanceData,
    onClose,
}: AttendanceRegularizationModalProps) {
    const [sessions, setSessions] = useState(
        attendanceData?.sessions ?? []
    );

    const [sessionChanges, setSessionChanges] = useState<SessionChange[]>([]);
    const [tempSessionCounter, setTempSessionCounter] = useState(1);
    const [validationError, setValidationError] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {

        if (!attendanceData)
            return;

        setSessions(
            attendanceData.sessions.map(session => ({
                ...session,
                checkIn: formatTime(session.checkIn),
                checkOut: formatTime(session.checkOut)
            }))
        );

        setSessionChanges([]);

    }, [attendanceData]);
    const handleSubmit = async () => {

        if (validationError) {
            alert(validationError);
            return;
        }

        if (!reason.trim()) {
            alert("Please enter reason.");
            return;
        }

        if (sessionChanges.length === 0) {
            alert("No changes found.");
            return;
        }

        if (!attendanceData) {
            return;
        }

        const request = {
            attendanceId: attendanceData.attendanceId,
            reason,
            sessionChanges
        };

        try {



            const response = await submitRegularizationRequest(request);

            if (response.success) {

                alert(response.message);

                onClose();

                return;
            }

            alert(response.message);

        }
        catch {

            alert("Unable to submit request.");

        }
        finally {



        }
    };
    const handleTimeChange = (
        sessionId: string,
        field: "checkIn" | "checkOut",
        value: string
    ) => {

        const updatedSessions = sessions.map(session => {

            if (session.sessionId !== sessionId)
                return session;

            const updatedSession = {
                ...session,
                [field]: value
            };

            updatedSession.workingHours = calculateWorkingHours(
                updatedSession.checkIn,
                updatedSession.checkOut
            );


            return updatedSession;

        });

        setSessions(updatedSessions);
        const error = validateAllSessions(updatedSessions);

        setValidationError(error);
        if (sessionId.startsWith("temp-")) {

            const session = updatedSessions.find(x => x.sessionId === sessionId);

            if (!session)
                return;

            setSessionChanges(previous =>
                previous.map(change => {

                    if (change.sessionId !== sessionId)
                        return change;

                    return {
                        ...change,
                        after: {
                            checkIn: session.checkIn,
                            checkOut: session.checkOut
                        }
                    };

                })
            );

            return;
        }

        const original = attendanceData?.sessions.find(
            x => x.sessionId === sessionId
        );

        if (!original)
            return;

        const edited = updatedSessions.find(
            x => x.sessionId === sessionId
        );

        if (!edited)
            return;

        const before = {
            checkIn: formatTime(original.checkIn),
            checkOut: formatTime(original.checkOut)
        };

        const after = {
            checkIn: edited.checkIn,
            checkOut: edited.checkOut
        };

        const isChanged =
            before.checkIn !== after.checkIn ||
            before.checkOut !== after.checkOut;

        setSessionChanges(previous => {

            const others = previous.filter(
                x => x.sessionId !== sessionId
            );

            if (!isChanged)
                return others;

            return [
                ...others,
                {
                    sessionId,
                    changeType: "edit",
                    before,
                    after
                }
            ];

        });

    };
    const handleAddSession = () => {

        const tempId = `temp-${tempSessionCounter}`;

        const newSession = {
            sessionId: tempId,
            sessionNumber: sessions.length + 1,
            checkIn: "",
            checkOut: "",
            workingHours: 0
        };

        const updatedSessions = [...sessions, newSession];

        setSessions(updatedSessions);

        setValidationError(validateAllSessions(updatedSessions));

        setSessionChanges(prev => [
            ...prev,
            {
                sessionId: tempId,
                changeType: "add",
                before: {
                    checkIn: "",
                    checkOut: ""
                },
                after: {
                    checkIn: "",
                    checkOut: ""
                }
            }
        ]);

        setTempSessionCounter(prev => prev + 1);

    };
    const handleDeleteSession = (sessionId: string) => {

        const session = sessions.find(x => x.sessionId === sessionId);

        if (!session)
            return;

        // New session (not saved in DB)
        if (sessionId.startsWith("temp-")) {

            const updatedSessions = sessions
                .filter(x => x.sessionId !== sessionId)
                .map((x, index) => ({
                    ...x,
                    sessionNumber: index + 1
                }));

            setSessions(updatedSessions);

            setSessionChanges(previous =>
                previous.filter(x => x.sessionId !== sessionId)
            );

            return;
        }

        // Existing session

        const updatedSessions = sessions
            .filter(x => x.sessionId !== sessionId)
            .map((x, index) => ({
                ...x,
                sessionNumber: index + 1
            }));

        setSessions(updatedSessions);
        const error = validateAllSessions(updatedSessions);
        setValidationError(error);

        const before = {
            checkIn: session.checkIn,
            checkOut: session.checkOut
        };

        setSessionChanges(previous => {

            const others = previous.filter(
                x => x.sessionId !== sessionId
            );

            return [
                ...others,
                {
                    sessionId,
                    changeType: "delete",
                    before,
                    after: {
                        checkIn: "",
                        checkOut: ""
                    }
                }
            ];

        });

    };
    const afterApprovalHours = useMemo(() => {

        return sessions.reduce((total, session) => {

            return total + (session.workingHours ?? 0);

        }, 0);

    }, [sessions]);
    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex-shrink-0 px-8 py-6 flex items-center justify-between bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-md w-fit mb-2">
                            <CalendarDays size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">{attendanceDate}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Attendance Regularization</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Left Column: Sessions */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Attendance Sessions</h3>
                                <button onClick={handleAddSession} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
                                    <Plus size={16} /> Add Session
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {sessions.map((session, index) => (
                                    <div key={session.sessionId} className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-sm">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5">#{index + 1}</span>
                                        <input type="time" value={session.checkIn} onChange={(e) =>
                                            handleTimeChange(
                                                session.sessionId,
                                                "checkIn",
                                                e.target.value
                                            )
                                        } className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2" />
                                        <span className="text-slate-400 dark:text-slate-500 text-sm">to</span>
                                        <input type="time" value={session.checkOut} onChange={(e) =>
                                            handleTimeChange(
                                                session.sessionId,
                                                "checkOut",
                                                e.target.value
                                            )
                                        } className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[50px] text-right">{formatWorkingHours(session.workingHours)}</span>
                                        <button onClick={() => handleDeleteSession(session.sessionId)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 transition"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                            {validationError && (
                                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                                    {validationError}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Reason + Summary */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Reason for Regularization</label>
                                <textarea value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-32 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                    placeholder="Explain why you are requesting this change..."
                                    maxLength={500}
                                />
                            </div>

                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Current Total</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatWorkingHours(attendanceData?.totalWorkingHours)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-emerald-700 font-semibold">After Approval</span>
                                    <span className="font-bold text-emerald-700"> {formatWorkingHours(afterApprovalHours)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-6 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 transition">Cancel</button>
                    <button onClick={handleSubmit } className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Submit Request</button>
                </div>
            </div>
        </div>
    );
}