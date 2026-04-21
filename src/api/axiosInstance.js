import axios from "axios";
import { Modal } from "antd";

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:3000/api",
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isSessionExpiredShown = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes("auth/login") ||
            error.config?.url?.includes("auth/forgot-password") ||
            error.config?.url?.includes("auth/reset-password");

        if (error.response?.status === 401 && !isAuthRequest && !isSessionExpiredShown) {
            isSessionExpiredShown = true;
            Modal.warning({
                title: 'Sesion Expirada',
                content: 'Tu sesión ha expirado o el token es inválido. Por favor, inicia sesión nuevamente.',
                okText: 'Entendido',
                onOk: () => {
                    isSessionExpiredShown = false;
                    localStorage.clear();
                    window.location.href = "/login";
                }
            });
        }
        return Promise.reject(error);
    }
);

export default api;