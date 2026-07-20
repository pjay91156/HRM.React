import api from "./api";
import { type UpdateMyProfileRequest } from "../models/Profile";

const getMyProfile = async () => {
    const response = await api.get("/Profile/me");
    return response.data;
};

const updateMyProfile = async (data: UpdateMyProfileRequest) => {
    const response = await api.put("/Profile/me", data);
    return response.data;
};

const updateMyProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/Profile/me/picture", formData, {
        headers: { "Content-Type": undefined }
    });
    return response.data;
};

export default {
    getMyProfile,
    updateMyProfile,
    updateMyProfilePicture
};
