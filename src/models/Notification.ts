export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    notifications: NotificationItem[];
    unreadCount: number;
}
