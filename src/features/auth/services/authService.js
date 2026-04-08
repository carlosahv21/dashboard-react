import api from "../../../api/axiosInstance.js";

export const authService = {
    me: () => api.get("/auth/me"),
    updateSettings: (payload) => api.put("/settings", payload),
};