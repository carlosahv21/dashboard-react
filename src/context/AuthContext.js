import React, { createContext, useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import useFetch from "../hooks/useFetch";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { request } = useFetch();
    const modalShownRef = useRef(false); // ← ref para controlar la aparición
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken && !user) {
            setLoading(true);
            request(`auth/me`, "GET", null, {
                Authorization: `Bearer ${storedToken}`,
            })
                .then(data => {
                    setUser(data.user);
                    setRoutes(data.routes);
                    setSettings(data.settings);
                    setToken(storedToken);
                })
                .catch((err) => {
                    // Si el error es token inválido o expirado
                    if (err.message === "Invalid or expired token" && !modalShownRef.current) {
                        modalShownRef.current = true; 
                        Modal.confirm({
                            title: "Sesión expirada",
                            content: "Tu sesión ha expirado. Debes iniciar sesión nuevamente.",
                            okText: "Aceptar",
                            onOk: () => logout(), // Limpia estado y token
                            cancelButtonProps: { style: { display: "none" } }
                        });
                    } else {
                        logout(); // Otros errores también pueden limpiar el estado
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token, user, request]);

    const logout = () => {
        setUser(null);
        setSettings(null);
        setRoutes([]);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, setUser, settings, setSettings, routes, setRoutes, token, setToken, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};
