const apiOrigin = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/?$/, "");

export const getMediaUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
};
