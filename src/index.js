import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import LoadingScreen from "./components/Common/LoadingScreen";

import Login from "./views/Auth/Login";
import DashboardLayout from "./views/Dashboard/Dashboard";

import DashboardView from "./views/Dashboard/DashboardView";
import Classes from "./views/Classes/Classes";
import Students from "./views/Students/Students";
import Teachers from "./views/Teachers/Teachers";
import Plans from "./views/Plans/Plans";

// Settings & Sub-rutas
import SettingsLayout from "./views/Settings/SettingsLayouts";


const AppRoutes = () => {
    const { user, loading, hasPermission } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;

    return (
        <Routes>
            <Route element={<DashboardLayout />}>

                <Route path="/" element={<DashboardView />} />

                {/* Planes*/}
                {hasPermission('plans:view') && (
                    <Route path="plans" element={<Plans />} />
                )}

                {/* Clases */}
                {hasPermission('classes:view') && (
                    <Route path="classes" element={<Classes />} />
                )}

                {/* Estudiantes */}
                {hasPermission('students:view') && (
                    <Route path="students" element={<Students />} />
                )}

                {/* Profesores */}
                {hasPermission('teachers:view') && (
                    <Route path="teachers" element={<Teachers />} />
                )}

                {hasPermission('settings:view') && (
                    <Route path="settings/*" element={<SettingsLayout />}>
                    </Route>
                )}

                <Route path="*" element={<Navigate to="/" />} />

            </Route>
        </Routes>
    );
};

const App = () => (
    <AuthProvider>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </AuthProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);