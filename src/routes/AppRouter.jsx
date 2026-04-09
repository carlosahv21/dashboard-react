import React, { Suspense, lazy, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "../components/Common/LoadingScreen";

// Auth
const Login = lazy(() => import("../features/auth/pages/LoginPage"));

// Layout Principal
const DashboardLayout = lazy(() => import("../features/dashboard/pages/DashboardLayout"));

// Vistas de Negocio
const DashboardView = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const Plans = lazy(() => import("../features/plans/pages/PlanPage"));
const Classes = lazy(() => import("../features/classes/pages/ClassPage"));
const Teachers = lazy(() => import("../features/teachers/pages/TeacherPage"));
// Estudiantes
const Students = lazy(() => import("../features/students/pages/StudentPage"));
const StudentHistory = lazy(() => import("../features/students/pages/StudentHistoryPage"));

const Registrations = lazy(() => import("../features/registrations/pages/RegistrationPage"));
const Attendances = lazy(() => import("../features/attendances/pages/AttendancePage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const Profile = lazy(() => import("../features/profile/pages/ProfilePage"));

// Configuración
const Settings = lazy(() => import("../features/settings/pages/SettingsPage"));

const AppRouter = () => {
    const { user, loading, hasPermission } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {!user ? (
                    <Route path="*" element={<Login />} />
                ) : (
                    <Route element={<DashboardLayout />}>

                        {/* Inicio */}
                        <Route path="/" element={<DashboardView />} />

                        {/* Gestión de Planes  */}
                        {hasPermission("plans:view") && (
                            <Route path="plans" element={<Plans />} />
                        )}

                        {/* Gestión de Clases  */}
                        {hasPermission("classes:view") && (
                            <Route path="classes" element={<Classes />} />
                        )}

                        {/* Módulo de Estudiantes e Historial  */}
                        {hasPermission("students:view") && (
                            <>
                                <Route path="students" element={<Students />} />
                                <Route path="students/:id/history" element={<StudentHistory />} />
                            </>
                        )}

                        {/* Profesores  */}
                        {hasPermission("teachers:view") && (
                            <Route path="teachers" element={<Teachers />} />
                        )}

                        {/* Inscripciones  */}
                        {hasPermission("registrations:view") && (
                            <Route path="registrations" element={<Registrations />} />
                        )}

                        {/* Asistencias  */}
                        {hasPermission("attendances:view") && (
                            <Route path="attendances" element={<Attendances />} />
                        )}

                        {/* Perfil de Usuario  */}
                        <Route path="profile" element={<Profile />} />

                        {/* Notificaciones del Sistema  */}
                        <Route path="notifications" element={<Notifications />} />

                        {/* Configuración (Maneja sus propias sub-rutas internas)  */}
                        {hasPermission("settings:view") && (
                                <Route path="settings/*" element={<Settings />} />
                        )}

                        {/* Redirección por defecto si la ruta no existe  */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                )}
            </Routes>
        </Suspense>
    );
};

export default AppRouter;