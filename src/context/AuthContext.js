import React, { createContext, useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import useFetch from "../hooks/useFetch";

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

    const fetchUserData = async (storedToken) => {
        try {
            const data = await request(`auth/me`, "GET", null, {
                Authorization: `Bearer ${storedToken}`,
            });

            setUser(data.user);
            setSettings(data.settings);

            if (data.permissions) {
                setPermissions(data.permissions);
            }
        } catch (err) {
            console.log(err);

            if (err.message === "Invalid or expired token" && !modalShownRef.current) {
                modalShownRef.current = true;
                Modal.confirm({
                    title: "Sesión expirada",
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
    };

    const toggleTheme = () => {
        setSettings(prev => {
            const newTheme = prev?.theme === 'dark' ? 'light' : 'dark';
            const newSettings = { ...prev, theme: newTheme };

            // Persistir setting localmente por si acaso, aunque idealmente debería ir al backend
            localStorage.setItem("theme", newTheme);

            // TODO: Aquí deberíamos llamar a un endpoint para guardar la preferencia del usuario
            // request('users/settings', 'POST', { theme: newTheme });

            return newSettings;
        });
    };

    useEffect(() => {
        if (token) {
            if (!user) {
                setLoading(true);
                fetchUserData(token).then(() => {
                    // Si el backend no devuelve settings, inicializamos desde localStorage
                    setSettings(prev => prev || { theme: localStorage.getItem("theme") || 'light' });
                });
            } else {
                setLoading(false);
            }
        } else {
            // Si no hay token, intentamos recuperar tema de localStorage para login screen
            setSettings({ theme: localStorage.getItem("theme") || 'light' });
            setLoading(false);
        }
    }, [token]);

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