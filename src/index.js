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

// Settings
import SettingsLayout from "./views/Settings/SettingsLayouts";

const AppRoutes = () => {
    const { user, routes, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;
    if (!user) return <Login />;

    // Solo renderizamos rutas que NO son hijos de Settings
    const renderRoutes = (routesArray) =>
        routesArray.flatMap(r => {
            if (r.name === "settings") {
                // La ruta padre Settings
                return (
                    <Route
                        key={r.id}
                        path={r.full_path + "/*"} // importante el /* para Outlet
                        element={<SettingsLayout />}
                    />
                );
            }

            if (r.children?.length > 0) {
                return renderRoutes(r.children);
            }

            // Componente principal de la ruta
            let Component;
            switch (r.name) {
                case "dashboard": Component = DashboardView; break;
                case "classes": Component = Classes; break;
                case "students": Component = Students; break;
                case "teachers": Component = Teachers; break;
                default: return null;
            }

            return <Route key={r.id} path={r.full_path} element={<Component />} />;
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
