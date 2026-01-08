import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import LoadingScreen from "./components/Common/LoadingScreen";

import Login from "./views/Auth/Login";
import DashboardLayout from "./views/Dashboard/Dashboard";

import DashboardView from "./views/Dashboard/DashboardView";
import Classes from "./views/Classes/Classes";
import Students from "./views/Students/Students";
import StudentHistory from "./views/Students/StudentHistory";
import Teachers from "./views/Teachers/Teachers";
import Plans from "./views/Plans/Plans";
import Registrations from "./views/Registrations/Registrations";
import Attendances from "./views/Attendances/Attendances";

// Settings & Sub-rutas
import SettingsLayout from "./views/Settings/SettingsLayouts";

import "./App.css";

const AppRoutes = () => {
  const { user, loading, hasPermission } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  if (!user)
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardView />} />

        {/* Planes*/}
        {hasPermission("plans:view") && (
          <Route path="plans" element={<Plans />} />
        )}

        {/* Clases */}
        {hasPermission("classes:view") && (
          <Route path="classes" element={<Classes />} />
        )}

        {/* Estudiantes */}
        {hasPermission("students:view") && (
          <>
            <Route path="students" element={<Students />} />
            <Route path="students/:id/history" element={<StudentHistory />} />
          </>
        )}

        {/* Profesores */}
        {hasPermission("teachers:view") && (
          <Route path="teachers" element={<Teachers />} />
        )}

        {/* Inscripciones */}
        {hasPermission("registrations:view") && (
          <Route path="registrations" element={<Registrations />} />
        )}

        {/* Asistencia */}
        {hasPermission("attendances:view") && (
          <Route path="attendances" element={<Attendances />} />
        )}

        {hasPermission("settings:view") && (
          <Route path="settings/*" element={<SettingsLayout />}></Route>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

const AppContent = () => {
  const { settings } = useContext(AuthContext);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const isDarkMode = settings?.theme === "dark";

  React.useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#121212" : "#F8F9FA";
  }, [isDarkMode]);

  const darkThemeConfig = {
    algorithm: darkAlgorithm,
    token: {
      colorBgBase: "#121212", // Fondo Principal
      colorBgContainer: "#1E1E1E", // Superficie Principal (Header, Sidebar, Content containers if not overridden)
      colorText: "#E0E0E0", // Texto Primario
      colorTextSecondary: "#A0A0A0", // Texto Secundario
      colorPrimary: "#0A84FF", // Color de Acento
      borderRadius: 8,
      colorBorder: "#2D2D2D",
      colorBorderSecondary: "#2D2D2D",
    },
    components: {
      Layout: {
        bodyBg: "#121212",
        headerBg: "#1E1E1E",
        siderBg: "#1E1E1E",
      },
      Card: {
        colorBgContainer: "#2D2D2D", // Superficie Secundaria
        colorBorderSecondary: "#2D2D2D",
        boxShadow: "none",
      },
      Table: {
        colorBgContainer: "#2D2D2D", // Superficie Secundaria
        headerBg: "#2D2D2D",
        borderColor: "#2D2D2D",
      },
      Menu: {
        darkItemBg: "#1E1E1E",
        itemSelectedBg: "rgba(10, 132, 255, 0.1)", // Menú Activo
        itemBg: "#1E1E1E",
      },
    },
  };

  const lightThemeConfig = {
    algorithm: defaultAlgorithm,
    token: {
      colorBgBase: "#F8F9FA",
      colorBgContainer: "#FFFFFF",
      colorText: "#2D3436",
      colorTextSecondary: "#6C757D",
      colorPrimary: "#0A84FF",
      borderRadius: 8,
      colorBorder: "#E0E0E0",
      colorBorderSecondary: "#E0E0E0",
    },
    components: {
      Card: {
        colorBorderSecondary: "#E0E0E0",
        boxShadow: "none",
      },
      Table: {
        borderColor: "#E0E0E0",
      },
    },
  };

  return (
    <ConfigProvider theme={isDarkMode ? darkThemeConfig : lightThemeConfig}>
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

const MainApp = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MainApp />);
