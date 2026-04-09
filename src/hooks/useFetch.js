import { useState, useCallback } from "react";
import api from "../api/axiosInstance";

/**
 * useFetch Hook
 * Refactored to use global axios instance with interceptors
 */
const useFetch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (endpoint, method = "GET", body = null, headers = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api({
                url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
                method,
                data: body,
                headers,
            });

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "An error occurred";
            setError(errorMessage);
            throw err.response?.data || err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
};

export default useFetch;
