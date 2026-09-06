import api from "./axiosConfig";

// Normal signup
export const registerUser = (data) =>
  api.post("/auth/signup", data);

// Normal login
export const loginUser = (data) =>
  api.post("/auth/login", data);

// Google signup / login
export const googleLoginUser = (data) =>
  api.post("/auth/google", data);