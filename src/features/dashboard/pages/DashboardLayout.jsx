import React, { useContext, useRef } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import Sidebar from "../../../components/layout/Sidebar";
import HeaderComponent from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

import { AuthContext } from "../../../context/AuthContext";
import { OnboardingProvider } from "../../../context/OnboardingContext";
import OnboardingWidget from "../../../components/Common/OnboardingWidget";
import AppOnboarding from "../../../components/Common/AppOnboarding";

// Custom hook to manage layout logic
const useDashboardLayout = (routes) => {
  const onboardingRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleRestartTour = () => {
    if (onboardingRef.current) {
      onboardingRef.current.startTour();
    }
  };

  return {
    onboardingRef,
    searchRef,
    profileRef,
    sidebarRef,
    handleRestartTour,
  };
};

const { Content } = Layout;

const DashboardContent = () => {
  const { routes } = useContext(AuthContext);
  const {
    onboardingRef,
    searchRef,
    profileRef,
    sidebarRef,
    handleRestartTour,
  } = useDashboardLayout(routes);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Onboarding Component */}
      <AppOnboarding
        ref={onboardingRef}
        customSteps={[
          {
            title: "¡Bienvenido!",
            description: "Te daremos un breve recorrido por el dashboard.",
            target: null,
          },
          {
            title: "Navegación",
            description: "Accede a las distintas secciones del sistema.",
            target: () => sidebarRef.current,
          },
          {
            title: "Búsqueda",
            description: "Usa este campo para buscar rápidamente.",
            target: () => searchRef.current,
          },
          {
            title: "Perfil de Usuario",
            description: "Aquí puedes ver tu información y cerrar sesión.",
            target: () => profileRef.current,
          },
          {
            title: "¡Todo listo!",
            description: "Ya puedes comenzar a usar la aplicación.",
            target: null,
          },
        ]}
      />

      <OnboardingWidget />

      {/* Fixed Sidebar */}
      <Sidebar routes={routes} ref={sidebarRef} />

      {/* Main Layout with left margin for sidebar */}
      <Layout style={{ marginLeft: 64 }}>
        {/* Header */}
        <HeaderComponent
          searchRef={searchRef}
          profileRef={profileRef}
          onRestartTour={handleRestartTour}
        />

        {/* Child route content */}
        <Content
          style={{
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <Outlet />
        </Content>

        {/* Footer */}
        <Footer />
      </Layout>
    </Layout>
  );
};

const DashboardLayout = () => (
  <OnboardingProvider>
    <DashboardContent />
  </OnboardingProvider>
);

export default DashboardLayout;
