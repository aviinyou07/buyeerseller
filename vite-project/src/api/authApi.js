import axiosClient from "./axiosClient";

export const sendLoginOtp = (payload) =>
  axiosClient.post("/auth/send-otp", payload);

export const sendSignupOtp = (payload) =>
  axiosClient.post("/auth/send-otp", payload);

export const verifyLoginOtp = (payload) =>
  axiosClient.post("/auth/verify-login", payload);

export const verifyRegisterOtp = (payload) =>
  axiosClient.post("/auth/verify-register", payload);

export const getMe = () => axiosClient.get("/auth/me");
