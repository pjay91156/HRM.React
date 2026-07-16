import React, { useEffect, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Send,
    Save,
    CalendarDays,
    User,
    Users,
    Star,
    CheckCircle2,
    Clock3,
    Circle
} from "lucide-react";
import { type PerformanceReview } from "../models/Review";

const Review: React.FC = () => {
    const initialPerformanceReview: PerformanceReview = {
        isEmployee: false,
        reviewMode: "Employee", // Employee | Manager

        performanceCycleName: "Mid-Year Review 2026",
        reviewPeriod: "01 Jan 2026 - 30 Jun 2026",
        employeeReviewPeriod: "16 Jun 2026 - 30 Jun 2026",
        managerReviewPeriod: "01 Jul 2026 - 15 Jul 2026",

        templateId: "TMP-001",
        templateName: "Engineering Performance Template",



        isSubmitted: false,

        categories: [
            {
                id: "CAT-001",
                categoryName: "Technical Skills",
                weightage: 40,
                skills: [
                    {
                        id: "SK-001",
                        skillName: "C# Development",
                        description: "Ability to develop scalable and maintainable .NET applications.",
                        weightage: 15,

                        selfReview: {
                            rating: 5,
                            comment:
                                "Developed multiple enterprise APIs using ASP.NET Core and followed clean architecture."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    },
                    {
                        id: "SK-002",
                        skillName: "ASP.NET Core",
                        description: "Knowledge of REST APIs, authentication and middleware.",
                        weightage: 15,

                        selfReview: {
                            rating: 4,
                            comment:
                                "Implemented JWT authentication, middleware, caching and Swagger."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    },
                    {
                        id: "SK-003",
                        skillName: "SQL Server",
                        description: "Database design, stored procedures and optimization.",
                        weightage: 10,

                        selfReview: {
                            rating: 5,
                            comment:
                                "Created optimized stored procedures and improved query performance."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    }
                ]
            },
            {
                id: "CAT-002",
                categoryName: "Communication",
                weightage: 30,
                skills: [
                    {
                        id: "SK-004",
                        skillName: "Verbal Communication",
                        description: "Communicates ideas clearly with the team.",
                        weightage: 15,

                        selfReview: {
                            rating: 4,
                            comment:
                                "Actively participated in sprint planning and technical discussions."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    },
                    {
                        id: "SK-005",
                        skillName: "Documentation",
                        description: "Creates clear technical documentation.",
                        weightage: 15,

                        selfReview: {
                            rating: 3,
                            comment:
                                "Need to improve documentation for APIs and deployment."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    }
                ]
            },
            {
                id: "CAT-003",
                categoryName: "Team Collaboration",
                weightage: 30,
                skills: [
                    {
                        id: "SK-006",
                        skillName: "Teamwork",
                        description: "Works effectively with cross-functional teams.",
                        weightage: 15,

                        selfReview: {
                            rating: 5,
                            comment:
                                "Frequently helped teammates resolve technical issues."
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    },
                    {
                        id: "SK-007",
                        skillName: "Problem Solving",
                        description: "Analyzes and resolves complex problems.",
                        weightage: 15,

                        selfReview: {
                            rating: null,
                            comment:
                                ""
                        },

                        managerReview: {
                            rating: null,
                            comment: ""
                        }
                    }
                ]
            }
        ]

    };

    const [performanceReview, setPerformanceReview] =
        useState<PerformanceReview>(initialPerformanceReview);
    const allSkills = performanceReview.categories.flatMap(
        category => category.skills
    );
   const managerSkills = performanceReview.categories.flatMap(
    category => category.skills
);

const overallManagerScore =
    managerSkills.length === 0
        ? 0
        : managerSkills.reduce(
              (sum, skill) => sum + (skill.managerReview.rating ?? 0),
              0
          ) / managerSkills.length;
  const calculateOverallSelfScore = () => {
    const skills = performanceReview.categories.flatMap(
        category => category.skills
    );

    if (skills.length === 0)
        return 0;

    const total = skills.reduce(
        (sum, skill) => sum + (skill.selfReview.rating ?? 0),
        0
    );

    return Number((total / skills.length).toFixed(1));
};
    const overallSelfScore = calculateOverallSelfScore();
    const updateSkillRating = (
        categoryId: string,
        skillId: string,
        rating: number
    ) => {

        setPerformanceReview(prev => ({

            ...prev,

            categories: prev.categories.map(category => {

                if (category.id !== categoryId)
                    return category;

                return {

                    ...category,

                    skills: category.skills.map(skill => {

                        if (skill.id !== skillId)
                            return skill;

                        return {

                            ...skill,

                            selfReview: {

                                ...skill.selfReview,

                                rating: rating

                            }

                        };

                    })

                };

            })

        }));

    };
    const completedSkills = allSkills.filter(skill =>
        performanceReview.isEmployee
            ? skill.selfReview.rating !== null
            : skill.managerReview.rating !== null
    );

    const progressPercentage =
        allSkills.length === 0
            ? 0
            : Math.round((completedSkills.length / allSkills.length) * 100);
    const RatingStars = ({
        rating,
        onRatingChange
    }: {
        rating: number | null;
        onRatingChange?: (rating: number) => void;
    }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={18}
                        onClick={() => onRatingChange?.(star)}
                        className={`cursor-pointer transition-all
        ${rating !== null && star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                    />
                ))}
            </div>
        );
    };
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set([performanceReview.categories[0].id])
    );

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
    const getCategoryProgress = (
        category: typeof performanceReview.categories[number]
    ) => {
        const totalSkills = category.skills.length;

        const reviewedSkills = category.skills.filter(skill =>
            performanceReview.isEmployee
                ? skill.selfReview.rating !== null
                : skill.managerReview.rating !== null
        ).length;

        const progress =
            totalSkills === 0
                ? 0
                : Math.round((reviewedSkills / totalSkills) * 100);

        return {
            totalSkills,
            reviewedSkills,
            progress,
        };
    };
    const updateSkillComment = (
        categoryId: string,
        skillId: string,
        comment: string
    ) => {

        setPerformanceReview(prev => ({

            ...prev,

            categories: prev.categories.map(category => {

                if (category.id !== categoryId)
                    return category;

                return {

                    ...category,

                    skills: category.skills.map(skill => {

                        if (skill.id !== skillId)
                            return skill;

                        return {

                            ...skill,

                            selfReview: {

                                ...skill.selfReview,

                                comment

                            }

                        };

                    })

                };

            })

        }));

    };
    const updateManagerRating = (
        categoryId: string,
        skillId: string,
        rating: number
    ) => {
        setPerformanceReview(prev => ({
            ...prev,
            categories: prev.categories.map(category => {

                if (category.id !== categoryId)
                    return category;

                return {
                    ...category,
                    skills: category.skills.map(skill => {

                        if (skill.id !== skillId)
                            return skill;

                        return {
                            ...skill,
                            managerReview: {
                                ...skill.managerReview,
                                rating
                            }
                        };
                    })
                };
            })
        }));
    };
    const updateManagerComment = (
        categoryId: string,
        skillId: string,
        comment: string
    ) => {
        setPerformanceReview(prev => ({
            ...prev,
            categories: prev.categories.map(category => {

                if (category.id !== categoryId)
                    return category;

                return {
                    ...category,
                    skills: category.skills.map(skill => {

                        if (skill.id !== skillId)
                            return skill;

                        return {
                            ...skill,
                            managerReview: {
                                ...skill.managerReview,
                                comment
                            }
                        };
                    })
                };
            })
        }));
    };
const saveReview = async (status: string) => {
debugger;
    const request = {
        ...performanceReview,
        status: status
    };

  console.log(request);
};
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Submit Reviews</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Complete your self-assessment for the current performance cycle.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => saveReview("Draft")}
                        className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                        <Save size={16}   />
                        Save Draft
                    </button>

                    <button onClick={() => saveReview("Submitted")}
                        className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B52F5] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
                    >
                        <Send size={16} />
                        Submit Review
                    </button>
                </div>
            </div>
            <div className="mt-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

                {/* Periods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-2">

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                            <CalendarDays
                                size={20}
                                className="text-indigo-600 dark:text-indigo-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Review Period
                            </p>

                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {performanceReview.reviewPeriod}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                            <User
                                size={20}
                                className="text-emerald-600 dark:text-emerald-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Employee Review
                            </p>

                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {performanceReview.employeeReviewPeriod}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40">
                            <Users
                                size={20}
                                className="text-orange-600 dark:text-orange-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Manager Review
                            </p>

                            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                {performanceReview.managerReviewPeriod}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2">

                    <div className="flex justify-between items-center mb-2">

                        <div>
                            <h6 className="font-semibold text-slate-900 dark:text-slate-100">
                                Overall Progress
                            </h6>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {completedSkills.length} of {allSkills.length} skills completed
                            </p>
                        </div>

                        <span className="text-lg font-bold text-[#6C63FF]">
                            {progressPercentage}%
                        </span>

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

                        {/* Self Review Score */}

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-400 p-4">
                            <div className="flex flex-col items-center justify-center h-full">

                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Overall Self Score
                                </p>

                                <div className="mt-2">
                                    <RatingStars
                                        rating={overallSelfScore}

                                    />
                                </div>

                                <p className="mt-2 text-2xl font-bold text-[#6C63FF]">
                                    {overallSelfScore.toFixed(1)}
                                    <span className="text-base font-medium text-slate-500"> / 5</span>
                                </p>

                            </div>
                        </div>

                        {/* Manager Review Score */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                            <div className="flex flex-col items-center justify-center h-full">

                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Overall Manager Score
                                </p>

                                <div className="mt-2">
                                    <RatingStars
                                        rating={overallManagerScore}

                                    />
                                </div>

                                <p className="mt-2 text-2xl font-bold text-[#6C63FF]">
                                    {overallManagerScore.toFixed(1)}
                                    <span className="text-base font-medium text-slate-500"> / 5</span>
                                </p>

                            </div>
                        </div>

                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6 ml-6">

                    {/* LEFT PANEL */}

                    <div className="lg:col-span-7 space-y-4">
                        {performanceReview.categories.map((category) => {

                            const isExpanded = expandedCategories.has(category.id);

                            return (

                                <div
                                    key={category.id}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                                >
                                    <>
                                        <button
                                            onClick={() => toggleCategory(category.id)}
                                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >

                                            <div className="flex items-center gap-3">

                                                {isExpanded ? (
                                                    <ChevronDown size={18} />
                                                ) : (
                                                    <ChevronRight size={18} />
                                                )}

                                                <h3 className="font-semibold text-lg">
                                                    {category.categoryName}
                                                </h3>

                                                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1">
                                                    {category.weightage}% Weightage
                                                </span>

                                            </div>

                                            <span className="text-sm text-slate-500">
                                                {category.skills.length} Skills
                                            </span>

                                        </button>
                                        {isExpanded && (

                                            <div className="border-t border-slate-200 dark:border-slate-700">
                                                <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">

                                                    <div className="col-span-4">
                                                        Skill & Description
                                                    </div>

                                                    <div className="col-span-1 text-center">
                                                        Weight
                                                    </div>

                                                    <div className="col-span-3">
                                                        Self Review
                                                    </div>

                                                    <div className="col-span-4">
                                                        Manager Review
                                                    </div>

                                                </div>
                                                {category.skills.map((skill, index) => (

                                                    <div
                                                        key={skill.id}
                                                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 px-6 py-5 border-t border-slate-200 dark:border-slate-700"
                                                    >
                                                        {/* Skill & Description */}

                                                        <div className="lg:col-span-4">

                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">
                                                                Skill
                                                            </p>

                                                            <div className="flex gap-3">
                                                                <span className="font-semibold text-slate-500">
                                                                    {index + 1}.
                                                                </span>

                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                                                        {skill.skillName}
                                                                    </h4>

                                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                                        {skill.description}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        {/* Weight */}

                                                        <div className="lg:col-span-1">

                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">
                                                                Weight
                                                            </p>

                                                            <div className="flex justify-start lg:justify-center">
                                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                                    {skill.weightage}%
                                                                </span>
                                                            </div>

                                                        </div>
                                                        {/* Self Review */}

                                                        <div className="lg:col-span-3">

                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">
                                                                Self Review
                                                            </p>

                                                            <RatingStars
                                                                rating={skill.selfReview.rating}
                                                                onRatingChange={(rating) =>
                                                                    updateSkillRating(
                                                                        category.id,
                                                                        skill.id,
                                                                        rating
                                                                    )
                                                                }
                                                            />

                                                            <textarea
                                                                value={skill.selfReview.comment}
                                                                placeholder="Comment"
                                                                onChange={(e) =>
                                                                    updateSkillComment(
                                                                        category.id,
                                                                        skill.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="mt-3 w-full h-22 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 resize-none overflow-y-auto"
                                                            />

                                                        </div>
                                                        {/* Manager Review */}
                                                        <div className="lg:col-span-3">

                                                            <p className="lg:hidden text-xs font-semibold uppercase text-slate-500 mb-2">
                                                                Manager Review
                                                            </p>

                                                            <RatingStars
                                                                rating={skill.managerReview.rating}
                                                                onRatingChange={(rating) =>
                                                                    updateManagerRating(
                                                                        category.id,
                                                                        skill.id,
                                                                        rating
                                                                    )
                                                                }
                                                            />

                                                            <textarea
                                                                value={skill.managerReview.comment}
                                                                placeholder="Comment"
                                                                onChange={(e) =>
                                                                    updateManagerComment(
                                                                        category.id,
                                                                        skill.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="mt-3 w-full h-22 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 resize-none overflow-y-auto"
                                                            />

                                                        </div>
                                                    </div>

                                                ))}
                                            </div>


                                        )}

                                    </>

                                </div>

                            );

                        })}
                    </div>

                    {/* RIGHT PANEL */}

                    <div className="lg:col-span-3">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 mr-6">

                            <h3 className="text-lg font-semibold">
                                Category Progress
                            </h3>

                            <div className="mt-5 space-y-5">

                                {performanceReview.categories.map(category => {

                                    const {
                                        totalSkills,
                                        reviewedSkills,
                                        progress
                                    } = getCategoryProgress(category);

                                    return (

                                        <div key={category.id}>

                                            <div className="flex justify-between mb-2">

                                                <span className="font-medium">
                                                    {category.categoryName}
                                                </span>

                                                <span className="text-sm text-slate-500">
                                                    {reviewedSkills}/{totalSkills}
                                                </span>

                                            </div>

                                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">

                                                <div
                                                    className="h-full rounded-full bg-[#6C63FF]"
                                                    style={{ width: `${progress}%` }}
                                                />

                                            </div>

                                            <div className="mt-1 text-right text-xs text-slate-500">
                                                {progress}% Complete
                                            </div>

                                        </div>

                                    );

                                })}

                            </div>


                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 mr-6 mt-5">

                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Rating Scale
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Use the following guide while evaluating each skill.
                            </p>

                            <div className="mt-5 space-y-4">

                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <div>
                                        <p className="font-medium">1 - Poor</p>
                                        <p className="text-xs text-slate-500">
                                            Performance does not meet expectations.
                                        </p>
                                    </div>

                                    <RatingStars rating={1} />
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <div>
                                        <p className="font-medium">2 - Fair</p>
                                        <p className="text-xs text-slate-500">
                                            Needs significant improvement.
                                        </p>
                                    </div>

                                    <RatingStars rating={2} />
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <div>
                                        <p className="font-medium">3 - Good</p>
                                        <p className="text-xs text-slate-500">
                                            Consistently meets expectations.
                                        </p>
                                    </div>

                                    <RatingStars rating={3} />
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <div>
                                        <p className="font-medium">4 - Very Good</p>
                                        <p className="text-xs text-slate-500">
                                            Frequently exceeds expectations.
                                        </p>
                                    </div>

                                    <RatingStars rating={4} />
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <div>
                                        <p className="font-medium">5 - Excellent</p>
                                        <p className="text-xs text-slate-500">
                                            Outstanding and consistently exceptional.
                                        </p>
                                    </div>

                                    <RatingStars rating={5} />
                                </div>

                            </div>

                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 mr-6 mt-5">

                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Review Tips
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Keep your feedback clear, objective, and constructive.
                            </p>

                            <div className="mt-5 space-y-4">

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-[#6C63FF]" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Rate each skill based on your actual performance during the review period.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-[#6C63FF]" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Support your rating with specific examples or achievements.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-[#6C63FF]" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Mention areas where you improved and where you would like to grow.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-[#6C63FF]" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Keep comments concise, professional, and relevant to the skill being reviewed.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-[#6C63FF]" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Ensure every skill has both a rating and a meaningful comment before submitting.
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};
export default Review;