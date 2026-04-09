import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../features/auth/services/authService.jsx";
import i18n from "i18next";
import dayjs from "dayjs";

export const AuthContext = createContext();

/**
 * Helper to safely parse localStorage items
 */
const safeParseItem = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        // Strict check to avoid "undefined" string breaking JSON.parse
        if (!item || item === "undefined" || item === "null") return fallback;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return fallback;
    }
};

/**
 * AuthProvider component
 * Manages user session, permissions, academy settings, and themes.
 */
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

    const login = useCallback((data) => {
        if (!data.token) return;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));
        localStorage.setItem("modules", JSON.stringify(data.modules || []));

        setUser(data.user);
        setPermissions(data.permissions || {});
        setModules(data.modules || []);
        
        if (data.academy || data.settings) {
            const newSettings = data.academy || data.settings;
            setSettings(newSettings);
            localStorage.setItem("settings", JSON.stringify(newSettings));
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            const { data } = await authService.me();
            
            // Normalize user data from API response
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
                localStorage.setItem("settings", JSON.stringify(newSettings));
            }
        } catch (err) {
            console.error("Auth verification failed:", err);
            // Automatic logout only on explicit auth failures
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // Handle initial auth check
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [fetchUserData]);

    // Global UI Sync (Language, Locale, Settings persistence)
    useEffect(() => {
        if (settings?.language) {
            i18n.changeLanguage(settings.language);
            dayjs.locale(settings.language);
        }
        // Sync theme with document for CSS-level styling if needed
        document.documentElement.setAttribute('data-theme', settings?.theme || 'light');
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

    /**
     * Permission checker
     * Format: "module:action" (e.g. "students:create")
     */
    const hasPermission = useCallback((permString) => {
        if (!permString) return true;
        const [module, action] = permString.split(":");
        if (!permissions || !permissions[module]) return false;
        if (action) return permissions[module].actions?.includes(action) || false;
        return true;
    }, [permissions]);

    const toggleTheme = async () => {
        const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
        setSettings(prev => ({ ...prev, theme: newTheme })); // Optimistic update
        
        try {
            // Remove meta timestamps for API payload
            const { created_at, updated_at, ...payload } = settings;
            await authService.updateSettings({ ...payload, theme: newTheme });
        } catch (error) {
            console.error("Failed to persist theme setting:", error);
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