import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Save,
    Send,
    Star,
    User,
    Users
} from "lucide-react";
import performanceReviewService from "../../services/performanceReviewService";
import performanceRatingService from "../../services/performanceRatingService";
import { type ReviewDetail, type SkillRatingInput } from "../../models/Review";
import { type PerformanceRating } from "../../models/PerformanceRating";
import Loader from "../common/Loader";

interface PerformanceReviewDetailProps {
    reviewId: string;
    mode: "employee" | "manager";
    onBack: () => void;
    onSubmitted: () => void;
}

const RatingStars = ({
    rating,
    onRatingChange,
    readOnly
}: {
    rating: number | null;
    onRatingChange?: (rating: number) => void;
    readOnly?: boolean;
}) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={18}
                onClick={() => !readOnly && onRatingChange?.(star)}
                className={`transition-all ${readOnly ? "cursor-default" : "cursor-pointer"} ${
                    rating !== null && star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300 dark:text-slate-600"
                }`}
            />
        ))}
    </div>
);

const PerformanceReviewDetail: React.FC<PerformanceReviewDetailProps> = ({
    reviewId,
    mode,
    onBack,
    onSubmitted
}) => {
    const [detail, setDetail] = useState<ReviewDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingAction, setSavingAction] = useState<"draft" | "submit" | null>(null);
    const [ratings, setRatings] = useState<Record<string, { rating: number | null; comment: string }>>({});
    const [overallComment, setOverallComment] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [ratingScale, setRatingScale] = useState<PerformanceRating[]>([]);

    useEffect(() => {
        loadDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId]);

    useEffect(() => {
        loadRatingScale();
    }, []);

    const loadRatingScale = async () => {
        try {
            const response = await performanceRatingService.getPerformanceRatings();
            if (response.success) {
                const scale: PerformanceRating[] = (response.data ?? [])
                    .filter((r: PerformanceRating) => r.isActive)
                    .sort((a: PerformanceRating, b: PerformanceRating) => a.displayOrder - b.displayOrder);
                setRatingScale(scale);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadDetail = async () => {
        setLoading(true);
        try {
            const response = mode === "employee"
                ? await performanceReviewService.getMyReviewDetail(reviewId)
                : await performanceReviewService.getTeamReviewDetail(reviewId);

            if (response.success) {
                const data: ReviewDetail = response.data;
                setDetail(data);

                const initial: Record<string, { rating: number | null; comment: string }> = {};
                data.categories.forEach((category) => {
                    category.skills.forEach((skill) => {
                        initial[skill.skillId] = mode === "employee"
                            ? { rating: skill.employeeRating, comment: skill.employeeComment ?? "" }
                            : { rating: skill.managerRating, comment: skill.managerComment ?? "" };
                    });
                });
                setRatings(initial);
                setOverallComment(
                    (mode === "employee" ? data.overallEmployeeComment : data.overallManagerComment) ?? ""
                );

                setExpandedCategories(new Set(data.categories.map((c) => c.categoryId)));
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => {
            const updated = new Set(prev);
            if (updated.has(categoryId)) {
                updated.delete(categoryId);
            } else {
                updated.add(categoryId);
            }
            return updated;
        });
    };

    const isWindowOpen = detail
        ? (mode === "employee" ? detail.isEmployeeWindowOpen : detail.isManagerWindowOpen)
        : false;

    const isLocked = detail
        ? (mode === "employee" ? detail.isEmployeeSubmitted : detail.isManagerCompleted)
        : false;

    const canEdit = isWindowOpen && !isLocked;

    const allSkills = useMemo(
        () => detail?.categories.flatMap((c) => c.skills) ?? [],
        [detail]
    );

    const completedSkills = allSkills.filter((s) => ratings[s.skillId]?.rating != null);
    const progressPercentage = allSkills.length === 0 ? 0 : Math.round((completedSkills.length / allSkills.length) * 100);

    const overallSelfScore = useMemo(() => {
        const skills = mode === "employee" ? allSkills : allSkills;
        if (skills.length === 0) return 0;
        const total = skills.reduce((sum, s) => {
            const val = mode === "employee" ? (ratings[s.skillId]?.rating ?? 0) : (s.employeeRating ?? 0);
            return sum + val;
        }, 0);
        return Number((total / skills.length).toFixed(1));
    }, [allSkills, ratings, mode]);

    const overallManagerScore = useMemo(() => {
        if (allSkills.length === 0) return 0;
        const total = allSkills.reduce((sum, s) => {
            const val = mode === "manager" ? (ratings[s.skillId]?.rating ?? 0) : (s.managerRating ?? 0);
            return sum + val;
        }, 0);
        return Number((total / allSkills.length).toFixed(1));
    }, [allSkills, ratings, mode]);

    const getCategoryProgress = (skills: ReviewDetail["categories"][number]["skills"]) => {
        const totalSkills = skills.length;
        const reviewedSkills = skills.filter((s) => ratings[s.skillId]?.rating != null).length;
        const progress = totalSkills === 0 ? 0 : Math.round((reviewedSkills / totalSkills) * 100);
        return { totalSkills, reviewedSkills, progress };
    };

    const updateRating = (skillId: string, rating: number) => {
        setRatings((prev) => ({ ...prev, [skillId]: { ...prev[skillId], rating } }));
    };

    const updateComment = (skillId: string, comment: string) => {
        setRatings((prev) => ({ ...prev, [skillId]: { ...prev[skillId], comment } }));
    };

    const saveReview = async (isDraft: boolean) => {
        if (!detail) return;

        const skillRatings: SkillRatingInput[] = allSkills.map((s) => ({
            skillId: s.skillId,
            rating: ratings[s.skillId]?.rating ?? null,
            comment: ratings[s.skillId]?.comment ?? ""
        }));

        setSavingAction(isDraft ? "draft" : "submit");
        try {
            const response = mode === "employee"
                ? await performanceReviewService.submitEmployeeReview(reviewId, { skillRatings, overallComment, isDraft })
                : await performanceReviewService.submitManagerReview(reviewId, { skillRatings, overallComment, isDraft });

            if (response.success) {
                if (isDraft) {
                    await loadDetail();
                } else {
                    onSubmitted();
                }
            }
        } finally {
            setSavingAction(null);
        }
    };

    if (loading) {
        return (
            <div className="py-24">
                <Loader />
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Performance review not found.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {detail.cycleName}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {mode === "employee"
                                ? "Complete your self-assessment for this performance cycle."
                                : `Reviewing: ${detail.employeeName}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canEdit ? (
                        <>
                            <button
                                onClick={() => saveReview(true)}
                                disabled={savingAction !== null}
                                className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                            >
                                <Save size={16} />
                                {savingAction === "draft" ? "Saving..." : "Save Draft"}
                            </button>

                            <button
                                onClick={() => saveReview(false)}
                                disabled={savingAction !== null}
                                className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-60"
                            >
                                <Send size={16} />
                                {savingAction === "submit" ? "Submitting..." : "Submit Review"}
                            </button>
                        </>
                    ) : isLocked ? (
                        <span className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            {mode === "employee" ? "Self review submitted" : "Manager review completed"} — locked from further edits
                        </span>
                    ) : (
                        <span className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Outside the {mode === "employee" ? "employee" : "manager"} review window — read only
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

                {/* Periods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                            <CalendarDays size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Review Period</p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {detail.reviewPeriodStart} - {detail.reviewPeriodEnd}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                            <User size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee Review</p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {detail.employeeReviewStart} - {detail.employeeReviewEnd}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40">
                            <Users size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Manager Review</p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {detail.managerReviewStart} - {detail.managerReviewEnd}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h6 className="font-semibold text-slate-900 dark:text-slate-100">Overall Progress</h6>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {completedSkills.length} of {allSkills.length} skills completed
                            </p>
                        </div>
                        <span className="text-lg font-bold text-[#6C63FF]">{progressPercentage}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <div
                            className="h-full rounded-full bg-[#6C63FF] transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Overall Scores */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Overall Self Score</p>
                                <div className="mt-2">
                                    <RatingStars rating={overallSelfScore} readOnly />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-[#6C63FF]">
                                    {overallSelfScore.toFixed(1)}
                                    <span className="text-base font-medium text-slate-500"> / 5</span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Overall Manager Score</p>
                                <div className="mt-2">
                                    <RatingStars rating={overallManagerScore} readOnly />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-[#6C63FF]">
                                    {overallManagerScore.toFixed(1)}
                                    <span className="text-base font-medium text-slate-500"> / 5</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 p-6 pt-0">

                    {/* LEFT PANEL */}
                    <div className="lg:col-span-7 space-y-4">
                        {detail.categories.map((category) => {
                            const isExpanded = expandedCategories.has(category.categoryId);

                            return (
                                <div
                                    key={category.categoryId}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                                >
                                    <button
                                        onClick={() => toggleCategory(category.categoryId)}
                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            <h3 className="font-semibold text-lg">{category.categoryName}</h3>
                                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1">
                                                {category.weightage}% Weightage
                                            </span>
                                        </div>
                                        <span className="text-sm text-slate-500">{category.skills.length} Skills</span>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-slate-200 dark:border-slate-700">
                                            <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                <div className="col-span-4">Skill & Description</div>
                                                <div className="col-span-1 text-center">Weight</div>
                                                <div className="col-span-3">Self Review</div>
                                                <div className="col-span-4">Manager Review</div>
                                            </div>

                                            {category.skills.map((skill, index) => {
                                                const editable = ratings[skill.skillId] ?? { rating: null, comment: "" };

                                                const selfRating = mode === "employee" ? editable.rating : skill.employeeRating;
                                                const selfComment = mode === "employee" ? editable.comment : (skill.employeeComment ?? "");
                                                const managerRating = mode === "manager" ? editable.rating : skill.managerRating;
                                                const managerComment = mode === "manager" ? editable.comment : (skill.managerComment ?? "");

                                                return (
                                                    <div
                                                        key={skill.skillId}
                                                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 px-6 py-5 border-t border-slate-200 dark:border-slate-700"
                                                    >
                                                        <div className="lg:col-span-4">
                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">Skill</p>
                                                            <div className="flex gap-3">
                                                                <span className="font-semibold text-slate-500">{index + 1}.</span>
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{skill.skillName}</h4>
                                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{skill.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-1">
                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">Weight</p>
                                                            <div className="flex justify-start lg:justify-center">
                                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{skill.weightage}%</span>
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-3">
                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">Self Review</p>
                                                            <RatingStars
                                                                rating={selfRating}
                                                                readOnly={mode !== "employee" || !canEdit}
                                                                onRatingChange={(rating) => updateRating(skill.skillId, rating)}
                                                            />
                                                            <textarea
                                                                value={selfComment}
                                                                readOnly={mode !== "employee" || !canEdit}
                                                                placeholder="Comment"
                                                                onChange={(e) => updateComment(skill.skillId, e.target.value)}
                                                                className={`mt-3 w-full h-22 rounded-md border border-slate-200 dark:border-slate-700 p-3 resize-none overflow-y-auto text-sm ${mode !== "employee" || !canEdit ? "bg-slate-50 dark:bg-slate-950 text-slate-500" : "bg-white dark:bg-slate-800"}`}
                                                            />
                                                        </div>

                                                        <div className="lg:col-span-4">
                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">Manager Review</p>
                                                            <RatingStars
                                                                rating={managerRating}
                                                                readOnly={mode !== "manager" || !canEdit}
                                                                onRatingChange={(rating) => updateRating(skill.skillId, rating)}
                                                            />
                                                            <textarea
                                                                value={managerComment}
                                                                readOnly={mode !== "manager" || !canEdit}
                                                                placeholder="Comment"
                                                                onChange={(e) => updateComment(skill.skillId, e.target.value)}
                                                                className={`mt-3 w-full h-22 rounded-md border border-slate-200 dark:border-slate-700 p-3 resize-none overflow-y-auto text-sm ${mode !== "manager" || !canEdit ? "bg-slate-50 dark:bg-slate-950 text-slate-500" : "bg-white dark:bg-slate-800"}`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="lg:col-span-3 space-y-5">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
                            <h3 className="text-lg font-semibold">Category Progress</h3>
                            <div className="mt-5 space-y-5">
                                {detail.categories.map((category) => {
                                    const { totalSkills, reviewedSkills, progress } = getCategoryProgress(category.skills);
                                    return (
                                        <div key={category.categoryId}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">{category.categoryName}</span>
                                                <span className="text-sm text-slate-500">{reviewedSkills}/{totalSkills}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div className="h-full rounded-full bg-[#6C63FF]" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="mt-1 text-right text-xs text-slate-500">{progress}% Complete</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rating Scale</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Use the following guide while evaluating each skill.
                            </p>
                            <div className="mt-5 space-y-4">
                                {ratingScale.length === 0 ? (
                                    <p className="text-sm text-slate-400 dark:text-slate-500">No rating scale configured.</p>
                                ) : (
                                    ratingScale.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                            <div>
                                                <p className="font-medium">{item.rating} - {item.ratingName}</p>
                                                {item.description && (
                                                    <p className="text-xs text-slate-500">{item.description}</p>
                                                )}
                                            </div>
                                            <RatingStars rating={item.rating} readOnly />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Overall Comment</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {mode === "employee" ? "Summarize your self-assessment." : "Summarize your feedback for this employee."}
                            </p>
                            <textarea
                                value={overallComment}
                                readOnly={!canEdit}
                                onChange={(e) => setOverallComment(e.target.value)}
                                className={`mt-3 w-full h-28 p-3 border border-slate-200 dark:border-slate-700 rounded-lg resize-none text-sm ${!canEdit ? "bg-slate-50 dark:bg-slate-950 text-slate-500" : "bg-white dark:bg-slate-900"}`}
                                placeholder="Overall comments for this review period..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReviewDetail;
