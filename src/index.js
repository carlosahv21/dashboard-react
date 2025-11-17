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
import Settings from "./views/Settings/Settings";

import "./App.css";

const AppRoutes = () => {
    const { user, routes, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    if (!user) return <Login />;

    const resolveComponent = (routeName) => {
        switch (routeName) {
            case "dashboard": return DashboardView;
            case "classes": return Classes;
            case "students": return Students;
            case "teachers": return Teachers;
            case "settings": return Settings;

            // Todas las subrutas de settings van al mismo componente
            case "settings.general":
            case "settings.activeModules":
            case "settings.roles":
            case "settings.permissions":
            case "settings.users":
            case "settings.customFields":
            case "settings.payments":
                return Settings;

            default:
                return null;
        }
    };

    const renderRoutes = (routesArray) =>
        routesArray.flatMap((r) => {
            if (r.children?.length > 0) return renderRoutes(r.children);

            const Component = resolveComponent(r.name);
            if (!Component) return null;

            return (
                <Route
                    key={r.id}
                    path={r.full_path}
                    element={<Component />}
                />
            );
        });

    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                {renderRoutes(routes)}
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
