import axiosClient from "./axiosClient";

export const sendSignupOtp = (payload) =>
  axiosClient.post("/auth/send-otp", payload);

export const loginUser = (payload) =>
  axiosClient.post("/auth/login", payload);

export const sendForgotPasswordOtp = (payload) =>
  axiosClient.post("/auth/send-otp", payload);

export const resetPassword = (payload) =>
  axiosClient.post("/auth/reset-password", payload);

export const verifyRegisterOtp = (payload) =>
  axiosClient.post("/auth/verify-register", payload);

export const getMe = () => axiosClient.get("/auth/me");
