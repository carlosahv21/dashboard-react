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
    const [permissions, setPermissions] = useState({});
    const [modules, setModules] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        localStorage.removeItem("modules");
        setUser(null);
        setSettings(null);
        setPermissions({});
        setModules([]);
        setToken(null);
        modalShownRef.current = false;
    };

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));
        localStorage.setItem("modules", JSON.stringify(data.modules || []));

        setToken(data.token);
        setUser(data.user);
        setSettings(data.academy);
        setPermissions(data.permissions || {});
        setModules(data.modules || []);
    };

    const fetchUserData = useCallback(async (storedToken) => {
        try {
            const response = await request(`auth/me`, "GET", null, {
                Authorization: `Bearer ${storedToken}`,
            });

            setUser(response.data.user);
            setSettings(response.data.academy || response.data.settings);

            if (response.data.permissions) {
                setPermissions(response.data.permissions);
            }
            if (response.data.modules) {
                setModules(response.data.modules);
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
            // Rehydrate state from localStorage if it exists so we don't flash empty UI
            const storedUser = localStorage.getItem("user");
            const storedPermissions = localStorage.getItem("permissions");
            const storedModules = localStorage.getItem("modules");

            if (storedUser && !user) setUser(JSON.parse(storedUser));
            if (storedPermissions && Object.keys(permissions).length === 0) setPermissions(JSON.parse(storedPermissions));
            if (storedModules && modules.length === 0) setModules(JSON.parse(storedModules));

            // We always fetch user data to verify the token with the backend
            setLoading(true);
            fetchUserData(token).then(() => {
                setSettings(prev => prev || initialSettings);
            });
        } else {
            setSettings(initialSettings);
            setLoading(false);
        }
    }, [token, fetchUserData]);

    const hasPermission = (permString) => {
        if (!permString) return true; // If no permission required, allow access

        const [module, action] = permString.split(":");

        // If the module doesn't exist in permissions, deny
        if (!permissions || !permissions[module]) return false;

        // If action is requested, check if the module has that action
        if (action) {
            return permissions[module].actions?.includes(action) || false;
        }

        // If only module was tested, just return if it's there
        return true;
    };

    return (
        <AuthContext.Provider
            value={{
                user, setUser, settings, setSettings,
                permissions, hasPermission, token, setToken,
                modules, setModules,
                logout, login, toggleTheme,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};