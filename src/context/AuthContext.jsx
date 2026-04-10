import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
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
 * Manages user session, permissions, academy settings (multitenant), and themes.
 *
 * State shape (aligned with backend response):
 *  - user:        { id, email, name, role, theme, language, ... }
 *  - academy:     { id, name, logo_url, plan, currency, date_format, address }
 *  - modules:     string[]  — list of enabled module keys for this academy
 *  - permissions: { [module]: { actions: string[], scope: string } }
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => safeParseItem("user", null));
    const [academy, setAcademy] = useState(() => safeParseItem("academy", null));
    const [permissions, setPermissions] = useState(() => safeParseItem("permissions", {}));
    const [modules, setModules] = useState(() => safeParseItem("modules", []));
    const [loading, setLoading] = useState(true);

    // --- Derived: keep legacy `settings` alias so existing consumers don't break ---
    // Merges academy business settings with user UI preferences into a single object.
    const settings = useMemo(() => ({
        // Academy business settings
        currency: academy?.currency ?? "USD",
        date_format: academy?.date_format ?? "DD/MM/YYYY",
        // User UI preferences
        theme: user?.theme ?? "light",
        language: user?.language ?? "es",
    }), [academy, user]);

    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null);
        setAcademy(null);
        setPermissions({});
        setModules([]);
        setLoading(false);
    }, []);

    /**
     * Called after a successful login OR as a partial state updater.
     * Expects the `data` field from the backend response:
     *   { token, user, academy, modules, permissions }
     *
     * Can also be called with only a subset of fields to patch specific slices
     * without affecting others (e.g. after a profile photo update: { token, user }).
     */
    const login = useCallback((data) => {
        // Token is required for a true login; for partial updates callers pass
        // the current token from localStorage so we keep the session alive.
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
        }

        if (data.academy) {
            localStorage.setItem("academy", JSON.stringify(data.academy));
            setAcademy(data.academy);
        }

        if (data.permissions) {
            localStorage.setItem("permissions", JSON.stringify(data.permissions));
            setPermissions(data.permissions);
        }

        if (data.modules) {
            localStorage.setItem("modules", JSON.stringify(data.modules));
            setModules(data.modules);
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

            if (data.academy) {
                setAcademy(data.academy);
                localStorage.setItem("academy", JSON.stringify(data.academy));
            }

            if (data.permissions) {
                setPermissions(data.permissions);
                localStorage.setItem("permissions", JSON.stringify(data.permissions));
            }

            if (data.modules) {
                setModules(data.modules);
                localStorage.setItem("modules", JSON.stringify(data.modules));
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

    // Global UI Sync — react to user language/theme changes
    useEffect(() => {
        const lang = user?.language ?? "es";
        const theme = user?.theme ?? "light";

        i18n.changeLanguage(lang);
        dayjs.locale(lang);
        document.documentElement.setAttribute("data-theme", theme);
    }, [user]);

    /**
     * Permission checker (string-based shorthand)
     * Format: "module:action" (e.g. "students:create")
     */
    const hasPermission = useCallback((permString) => {
        if (!permString) return true;
        const [module, action] = permString.split(":");
        if (!permissions || !permissions[module]) return false;
        if (action) return permissions[module].actions?.includes(action) ?? false;
        return true;
    }, [permissions]);

    /**
     * Check if a specific module is enabled for this academy.
     */
    const hasModule = useCallback((moduleName) => {
        return modules.includes(moduleName);
    }, [modules]);

    const toggleTheme = async () => {
        const newTheme = user?.theme === "dark" ? "light" : "dark";
        const updatedUser = { ...user, theme: newTheme };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        try {
            await authService.updateSettings({ theme: newTheme });
        } catch (error) {
            console.error("Failed to persist theme setting:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, academy, settings, permissions, modules, loading,
            login, logout, hasPermission, hasModule, toggleTheme,
        }}>
            {children}
        </AuthContext.Provider>
    );
};