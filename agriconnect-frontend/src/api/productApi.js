import api from "./axiosConfig";

export const addProduce = (data) => api.post("/produce", data);
export const getMyProduce = () => api.get("/produce/my");
export const deleteProduce = (id) => api.delete(`/produce/${id}`);