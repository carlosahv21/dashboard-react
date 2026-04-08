import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../features/auth/services/authService";
import i18n from "i18next";
import dayjs from "dayjs";

export const AuthContext = createContext();

const safeParseItem = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item && item !== "undefined" ? JSON.parse(item) : fallback;
    } catch (error) {
        return fallback;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => safeParseItem("user", null));
    const [settings, setSettings] = useState(() => safeParseItem("settings", { theme: 'light', language: 'es' }));
    const [permissions, setPermissions] = useState(() => safeParseItem("permissions", {}));
    const [modules, setModules] = useState(() => safeParseItem("modules", []));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null);
        setSettings({ theme: 'light', language: 'es' });
        setPermissions({});
        setModules([]);
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));
        localStorage.setItem("modules", JSON.stringify(data.modules || []));

        setUser(data.user);
        setPermissions(data.permissions || {});
        setModules(data.modules || []);
        if (data.academy) setSettings(data.academy);
    };

    const fetchUserData = useCallback(async () => {
        try {
            const { data } = await authService.me();
            
            // Dependiendo de si la API devuelve { user, permissions } o solo el modelo de usuario { id, email }
            const userData = data.user || (data.id ? data : null);
            
            if (userData) {
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            }
            
            if (data.permissions) {
                setPermissions(data.permissions);
                localStorage.setItem("permissions", JSON.stringify(data.permissions));
            }
            
            if (data.modules) {
                setModules(data.modules);
                localStorage.setItem("modules", JSON.stringify(data.modules));
            }
            
            if (data.academy || data.settings) {
                const newSettings = data.academy || data.settings;
                setSettings(newSettings);
            }
        } catch (err) {
            console.error("Auth verify failed", err);
            // Only logout if the error is an unauthenticated response, 
            // otherwise keep the cached user session (e.g. for 500 backend errors)
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log("Auth verify failed", err);
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // Sincronización de UI (Idioma/Fechas)
    useEffect(() => {
        if (settings?.language) {
            i18n.changeLanguage(settings.language);
            dayjs.locale(settings.language);
        }
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [fetchUserData]);

    const hasPermission = (permString) => {
        if (!permString) return true;
        const [module, action] = permString.split(":");
        if (!permissions || !permissions[module]) return false;
        if (action) return permissions[module].actions?.includes(action) || false;
        return true;
    };

    const toggleTheme = async () => {
        const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
        setSettings(prev => ({ ...prev, theme: newTheme })); // Optimistic update
        try {
            const { created_at, updated_at, ...payload } = settings;
            await authService.updateSettings({ ...payload, theme: newTheme });
        } catch (error) {
            console.error("Error saving theme", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, settings, permissions, modules, loading,
            login, logout, hasPermission, toggleTheme
        }}>
            {children}
        </AuthContext.Provider>
    );
};