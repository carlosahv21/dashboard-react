import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { RoutesProvider } from "./context/RoutesContext";

import Login from "./views/Auth/Login";
import Layout from "./views/Layout/Layout";
import Dashboard from "./views/Dashboard/Dashboard";
import Settings from "./views/Settings/Settings";
import Classes from "./views/Classes/Classes";
import Students from "./views/Students/Students";
import Teachers from "./views/Teachers/Teachers.js";

import "./App.css";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    return (
        <SettingsProvider>
            <RoutesProvider>
                <BrowserRouter>
                    {isAuthenticated ? (
                        <Routes>
                            <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="classes" element={<Classes />} />
                                <Route path="student" element={<Students />} />
                                <Route path="teacher" element={<Teachers />} />

                                {/* Rutas anidadas para Settings */}
                                <Route path="settings/*" element={<Settings />} /> {/* Importante el /* */}

                                <Route path="*" element={<Navigate to="/" />} />
                            </Route>
                        </Routes>
                    ) : (
                        <Login setIsAuthenticated={setIsAuthenticated} />
                    )}
                </BrowserRouter>
            </RoutesProvider>
        </SettingsProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);