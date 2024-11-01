import { useState, useCallback } from "react";

const API_BASE_URL = process.env.REACT_APP_BACKEND;

const useFetch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (endpoint, method = "GET", body = null, headers = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Configuración de opciones sin body en métodos GET y HEAD
            const options = {
                method,
                headers: {
                    ...(body && !(body instanceof FormData) && method !== "GET" && { "Content-Type": "application/json" }),
                    ...headers,
                },
                ...(method !== "GET" && method !== "HEAD" && { body: body instanceof FormData ? body : JSON.stringify(body) })
            };

            const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, options);
            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(data?.message || `Failed to ${method} data`);
            }

            return data;
        } catch (error) {
            setError(error.message || "An error occurred");
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
};

export default useFetch;
