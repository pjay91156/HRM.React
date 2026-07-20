import type { RegisterRequest } from "../models/RegisterModel";
import type { LoginRequest } from "../models/LoginModel";
import api from "./api";

export const register = async (data: RegisterRequest) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};


export const login = async (data: LoginRequest) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout", {}, { skipSuccessToast: true });
  return response.data;
};