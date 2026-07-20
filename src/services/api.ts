import axios from "axios";
import { toast } from "react-toastify";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipSuccessToast?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Separate instance (no interceptors) so the refresh call itself can't recurse
// into the 401 handler below.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((response) => {
        const token = response.data?.data?.token;
        if (token) {
          localStorage.setItem("token", token);
        }
        return token ?? null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(

    (response) => {

        const method = response.config.method?.toLowerCase();

        // Show success message only for Create/Update/Delete APIs (not for data retrieval calls)
        if (
            response.data?.message &&
            method &&
            ["post", "put", "delete"].includes(method) &&
            !response.config.skipSuccessToast
        ) {
            toast.success(response.data.message);
        }

        return response;
    },

    async (error) => {

        const originalRequest = error.config;

        const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh");

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            const newToken = await refreshAccessToken();

            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }

            localStorage.removeItem("token");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        }
        else {
            toast.error("Something went wrong.");
        }

        return Promise.reject(error);
    }
);

export default api;