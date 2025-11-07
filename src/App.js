import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { RoutesProvider } from "./context/RoutesContext";

import Login from "./views/Auth/Login";
import Layout from "./views/Layout/Layout";
import Dashboard from "./views/Dashboard/Dashboard";
import Settings from "./views/Settings/Settings";
import Classes from "./views/Classes/Classes";
import CreateOrEditClass from "./views/Classes/CreateOrEditClass";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Revisar token al iniciar la app
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <SettingsProvider>
            <RoutesProvider>
                <BrowserRouter>
                    <Routes>
                        {/* --- Rutas públicas --- */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute isAuthenticated={isAuthenticated}>
                                    <Login setIsAuthenticated={setIsAuthenticated} />
                                </PublicRoute>
                            }
                        />

                        {/* --- Rutas privadas --- */}
                        <Route
                            path="/*"
                            element={
                                <PrivateRoute isAuthenticated={isAuthenticated}>
                                    <Layout setIsAuthenticated={setIsAuthenticated} />
                                </PrivateRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="classes" element={<Classes />} />
                            <Route path="classes/create" element={<CreateOrEditClass />} />
                            <Route path="classes/edit/:id" element={<CreateOrEditClass />} />
                            <Route path="settings/*" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </RoutesProvider>
        </SettingsProvider>
    );
};

export default App;
