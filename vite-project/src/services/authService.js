import { startSession } from "./marketplaceData";

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const getResponseData = (response) =>
  response?.data?.data || response?.data || {};

export const getResponseOtp = (response) => {
  const data = getResponseData(response);

  return data.otp || data.devOtp || data.testOtp || response?.data?.otp || "";
};

export const completeAuthSession = (response, fallbackUser = {}) => {
  const data = getResponseData(response);
  const user = data.user || data.currentUser || data.profile || fallbackUser;
  const role = user.role === "user" ? "buyer" : user.role || fallbackUser.role || "buyer";
  const normalizedUser = {
    ...fallbackUser,
    ...user,
    fullName: user.fullName || user.name || fallbackUser.fullName,
    role,
  };
  const token =
    data.token ||
    data.accessToken ||
    data.authToken ||
    response?.data?.token ||
    response?.data?.accessToken ||
    "";

  return startSession(normalizedUser, token);
};
