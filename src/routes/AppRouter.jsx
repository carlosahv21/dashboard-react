import React, { Suspense, lazy, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "../components/Common/LoadingScreen";

// Auth
const Login = lazy(() => import("../features/auth/pages/LoginPage"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPasswordPage"));

// Layout Principal
const DashboardLayout = lazy(() => import("../features/dashboard/pages/DashboardLayout"));

// Vistas de Negocio
const DashboardView = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const Plans = lazy(() => import("../features/plans/pages/PlanPage"));
const PlanDetails = lazy(() => import("../features/plans/pages/PlanDetailsPage"));

// Clases
const Classes = lazy(() => import("../features/classes/pages/ClassPage"));
const ClassDetails = lazy(() => import("../features/classes/pages/ClassDetailsPage"));

// Profesores
const Teachers = lazy(() => import("../features/teachers/pages/TeacherPage"));
const TeacherProfile = lazy(() => import("../features/teachers/pages/TeacherProfilePage"));

// Estudiantes
const Students = lazy(() => import("../features/students/pages/StudentPage"));
const StudentProfile = lazy(() => import("../features/students/pages/StudentProfilePage"));
const StudentHistory = lazy(() => import("../features/students/pages/StudentHistoryPage"));

const RegistrationList = lazy(() => import("../features/registrations/pages/RegistrationListPage"));
const RegistrationEnroll = lazy(() => import("../features/registrations/pages/RegistrationPage"));
const AttendanceTrack = lazy(() => import("../features/attendances/pages/AttendancePage"));
const AttendanceList = lazy(() => import("../features/attendances/pages/AttendanceListPage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const Profile = lazy(() => import("../features/profile/pages/ProfilePage"));

// Configuración
const Settings = lazy(() => import("../features/settings/pages/SettingsPage"));

// Conexiones
const Connections = lazy(() => import("../features/connections/pages/ConnectionsPage"));

const AppRouter = () => {
    const { user, loading, hasPermission } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {!user ? (
                    <>
                        <Route path="reset-password/:token" element={<ResetPassword />} />
                        <Route path="*" element={<Login />} />
                    </>
                ) : (
                    <Route element={<DashboardLayout />}>

                        {/* Inicio */}
                        <Route path="/" element={<DashboardView />} />

                        {/* Gestión de Planes  */}
                        {hasPermission("plans:view") && (
                            <>
                                <Route path="plans" element={<Plans />} />
                                <Route path="plans/:id/details" element={<PlanDetails />} />
                            </>
                        )}

                        {/* Conexiones */}
                        {hasPermission("connections:view") && (
                            <Route path="connections" element={<Connections />} />
                        )}

                        {/* Gestión de Clases  */}
                        {hasPermission("classes:view") && (
                            <>
                                <Route path="classes" element={<Classes />} />
                                <Route path="classes/:id/details" element={<ClassDetails />} />
                            </>
                        )}

                        {/* Módulo de Estudiantes e Historial  */}
                        {hasPermission("students:view") && (
                            <>
                                <Route path="students" element={<Students />} />
                                <Route path="students/:id/profile" element={<StudentProfile />} />
                                <Route path="students/:id/history" element={<StudentHistory />} />
                            </>
                        )}

                        {/* Profesores  */}
                        {hasPermission("teachers:view") && (
                            <>
                                <Route path="teachers" element={<Teachers />} />
                                <Route path="teachers/:id/profile" element={<TeacherProfile />} />
                            </>
                        )}

                        {/* Inscripciones  */}
                        {hasPermission("registrations:view") && (
                            <>
                                <Route path="registrations" element={<RegistrationEnroll />} />
                                <Route path="registrations/list" element={<RegistrationList />} />
                            </>
                        )}

                        {/* Asistencias  */}
                        {hasPermission("attendances:view") && (
                            <>
                                <Route path="attendances" element={<AttendanceTrack />} />
                                <Route path="attendances/list" element={<AttendanceList />} />
                            </>
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