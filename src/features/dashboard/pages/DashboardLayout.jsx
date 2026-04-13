import React, { useContext, useRef, useEffect } from "react";
import { Layout, Modal } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../../../components/layout/Sidebar";
import HeaderComponent from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

import { AuthContext } from "../../../context/AuthContext";
import { OnboardingProvider, useOnboarding } from "../../onboarding/context/OnboardingContext";
import OnboardingWidget from "../../onboarding/components/OnboardingWidget";
import AppOnboarding from "../../onboarding/components/AppOnboarding";

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
  const { routes, user } = useContext(AuthContext);
  const { isOpen, isTourFinished } = useOnboarding();
  const navigate = useNavigate();
  const alertShownRef = useRef(false);

  const {
    onboardingRef,
    searchRef,
    profileRef,
    sidebarRef,
    handleRestartTour,
  } = useDashboardLayout(routes);

  useEffect(() => {
    if (isTourFinished && !isOpen && user?.needs_password_change && !alertShownRef.current) {
      alertShownRef.current = true;
      Modal.confirm({
        title: "Actualiza tu contraseña",
        content: "Tu contraseña no se ha modificado, cámbiala ya.",
        okText: "Cambiar ahora",
        cancelText: "Más tarde",
        onOk: () => {
          navigate("/profile");
        },
        onCancel: () => {
          // Si elige más tarde, podríamos dejar que vuelva a aparecer en la próxima recarga
          // o mantener la referencia para no molestar en la misma sesión.
        }
      });
    }
  }, [isOpen, isTourFinished, user?.needs_password_change, navigate]);

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
