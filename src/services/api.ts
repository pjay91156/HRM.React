import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.response.use(

    (response) => {

        const method = response.config.method?.toLowerCase();

        // Show success message only for Create/Update/Delete APIs
        if (
            response.data?.message &&
            method &&
            ["post", "put", "delete"].includes(method)
        ) {
            toast.success(response.data.message);
        }

        return response;
    },

    (error) => {

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