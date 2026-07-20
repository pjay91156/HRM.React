import React, { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, ClipboardList } from "lucide-react";
import performanceReviewService from "../services/performanceReviewService";
import { type ReviewListItem } from "../models/Review";
import Loader from "../components/common/Loader";
import PerformanceReviewDetail from "../components/performance/PerformanceReviewDetail";

const statusBadge: Record<string, string> = {
    "Not Started": "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    Submitted: "bg-amber-50 text-amber-600",
    Completed: "bg-emerald-50 text-emerald-600"
};

const MyTeamReview: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const response = await performanceReviewService.getMyTeamReviews();
            if (response.success) {
                setReviews(response.data ?? []);
            }
        } finally {
            setLoading(false);
        }
    };

    if (selectedReviewId) {
        return (
            <PerformanceReviewDetail
                reviewId={selectedReviewId}
                mode="manager"
                onBack={() => setSelectedReviewId(null)}
                onSubmitted={() => {
                    setSelectedReviewId(null);
                    loadReviews();
                }}
            />
        );
    }

    const filteredReviews = reviews.filter((r) => (activeTab === "active" ? !r.isHistory : r.isHistory));

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Team Review</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Rate your direct reports for active performance cycles.
                </p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "active" ? "border-[#6C63FF] text-[#6C63FF]" : "border-transparent text-slate-500 dark:text-slate-400"}`}
                >
                    Active Cycles
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "history" ? "border-[#6C63FF] text-[#6C63FF]" : "border-transparent text-slate-500 dark:text-slate-400"}`}
                >
                    History
                </button>
            </div>

            {loading ? (
                <div className="py-24">
                    <Loader />
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                        <ClipboardList size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No {activeTab === "active" ? "active" : "past"} team reviews found
                    </h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReviews.map((review) => (
                        <button
                            key={review.id}
                            onClick={() => setSelectedReviewId(review.id)}
                            className="text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{review.employeeName}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{review.cycleName}</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <CalendarDays size={13} />
                                        {review.reviewPeriodStart} - {review.reviewPeriodEnd}
                                    </p>
                                </div>
                                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge[review.status] ?? "bg-slate-100 text-slate-600"}`}>
                                    {review.status}
                                </span>
                                {review.isWindowOpen && (
                                    <span className="text-xs font-medium text-indigo-600">Editable now</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTeamReview;
