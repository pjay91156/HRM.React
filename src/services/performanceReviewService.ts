import api from "./api";
import { type SkillRatingInput } from "../models/Review";

const getMyReviews = async () => {
    const response = await api.get("/EmployeePerformanceReview/my-reviews");
    return response.data;
};

const getMyReviewDetail = async (id: string) => {
    const response = await api.get(`/EmployeePerformanceReview/my-reviews/${id}`);
    return response.data;
};

const submitEmployeeReview = async (
    id: string,
    data: { skillRatings: SkillRatingInput[]; overallComment: string; isDraft: boolean }
) => {
    const response = await api.put(`/EmployeePerformanceReview/my-reviews/${id}`, data);
    return response.data;
};

const getMyTeamReviews = async () => {
    const response = await api.get("/EmployeePerformanceReview/my-team-reviews");
    return response.data;
};

const getTeamReviewDetail = async (id: string) => {
    const response = await api.get(`/EmployeePerformanceReview/my-team-reviews/${id}`);
    return response.data;
};

const submitManagerReview = async (
    id: string,
    data: { skillRatings: SkillRatingInput[]; overallComment: string; isDraft: boolean }
) => {
    const response = await api.put(`/EmployeePerformanceReview/my-team-reviews/${id}`, data);
    return response.data;
};

export default {
    getMyReviews,
    getMyReviewDetail,
    submitEmployeeReview,
    getMyTeamReviews,
    getTeamReviewDetail,
    submitManagerReview
};
