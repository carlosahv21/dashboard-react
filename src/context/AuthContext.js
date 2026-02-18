import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "antd";
import useFetch from "../hooks/useFetch";
import i18n from "i18next";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { request } = useFetch();
    const modalShownRef = useRef(false);

    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setSettings(null);
        setPermissions([]);
        setToken(null);
        modalShownRef.current = false;
    };

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const fetchUserData = useCallback(async (storedToken) => {
        try {
            const response = await request(`auth/me`, "GET", null, {
                Authorization: `Bearer ${storedToken}`,
            });

            setUser(response.data.user);
            setSettings(response.data.settings);

            if (response.data.permissions) {
                setPermissions(response.data.permissions);
            }
        } catch (err) {
            if (err.message === "Sesión expirada o token inválido" && !modalShownRef.current) {
                modalShownRef.current = true;
                Modal.confirm({
                    title: "Sesión expirada o token inválido",
                    content: "Tu sesión ha expirado. Debes iniciar sesión nuevamente.",
                    okText: "Aceptar",
                    onOk: () => logout(),
                    cancelButtonProps: { style: { display: "none" } }
                });
            } else {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [request]);

    const toggleTheme = async () => {
        const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';

        // Optimistic update
        setSettings(prev => ({ ...prev, theme: newTheme }));

        try {
            const payload = { ...(settings || {}), theme: newTheme };
            
            delete payload.created_at;
            delete payload.updated_at;
            
            await request("settings", "PUT", payload);
        } catch (error) {
            console.error("Failed to persist theme preference:", error);
        }
    };

    // Sincronizar idioma y díajs con el settings
    useEffect(() => {
        if (settings?.language) {
            i18n.changeLanguage(settings.language);
            dayjs.locale(settings.language);
        }
    }, [settings?.language]);

    // Persistencia centralizada de settings
    useEffect(() => {
        if (settings) {
            localStorage.setItem("settings", JSON.stringify(settings));
            if (settings.theme) localStorage.setItem("theme", settings.theme);
        }
    }, [settings]);

    useEffect(() => {
        const storedSettings = localStorage.getItem("settings");
        const initialSettings = storedSettings ? JSON.parse(storedSettings) : {
            theme: localStorage.getItem("theme") || 'light',
            language: i18n.language || 'es'
        };

        if (token) {
            if (!user) {
                setLoading(true);
                fetchUserData(token).then(() => {
                    // Si el backend no devuelve settings, usamos los iniciales
                    setSettings(prev => prev || initialSettings);
                });
            } else {
                setLoading(false);
            }
        } else {
            setSettings(initialSettings);
            setLoading(false);
        }
    }, [token, fetchUserData]);

    const hasPermission = (permName) => permissions.includes(permName);

    return (
        <AuthContext.Provider
            value={{
                user, setUser, settings, setSettings,
                permissions, hasPermission, token, setToken,
                logout, login, toggleTheme,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};