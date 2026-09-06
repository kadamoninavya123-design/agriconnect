import api from "./axiosConfig";

export const registerUser = (data) => api.post("/auth/signup", data);
// data = { name, email, password, phone, role: "FARMER" | "BUSINESS" | "ADMIN" }

export const loginUser = (data) => api.post("/auth/login", data);
// data = { email, password }