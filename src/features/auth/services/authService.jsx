import api from "../../../api/axiosInstance.js";

export const authService = {
    /**
     * Sends login credentials to the API.
     * @param {{ email: string, password: string }} credentials
     * @returns {Promise<import("axios").AxiosResponse>}
     */
    login: (credentials) => api.post("auth/login", credentials),
    me: () => api.get("/auth/me"),
    updateSettings: (id, payload) => api.put(`users/${id}`, payload),
    forgotPassword: (email) => api.post("auth/forgot-password", { email }),
    resetPassword: (token, password) => api.post(`auth/reset-password/${token}`, { password }),
    verifyResetToken: (token) => api.get(`auth/reset-password/${token}`),
};

export default authService;