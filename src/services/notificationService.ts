import api from "./api";
import { type NotificationListResponse } from "../models/Notification";

export const getMyNotifications = async (): Promise<NotificationListResponse> => {
    const response = await api.get("notification");
    return response.data.data;
};

export const markNotificationAsRead = async (id: string) => {
    const response = await api.put(
        `notification/${id}/read`,
        null,
        { skipSuccessToast: true }
    );
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.put(
        "notification/read-all",
        null,
        { skipSuccessToast: true }
    );
    return response.data;
};
