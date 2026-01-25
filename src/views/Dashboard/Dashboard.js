import React, { useContext } from "react";
import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import HeaderComponent from "../../components/Header";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AppOnboarding from "../../components/Common/AppOnboarding";
import { OnboardingProvider } from "../../context/OnboardingContext";
import OnboardingWidget from "../../components/Common/OnboardingWidget";

const { Content } = Layout;

const DashboardContent = () => {
    const { routes } = useContext(AuthContext);
    const onboardingRef = React.useRef(null);

    // Refs for onboarding steps
    const searchRef = React.useRef(null);
    const profileRef = React.useRef(null);
    const sidebarRef = React.useRef(null);

    const handleRestartTour = () => {
        if (onboardingRef.current) {
            onboardingRef.current.startTour();
        }
    };

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
                    }
                ]}
            />

            <OnboardingWidget />

            {/* Fixed Sidebar */}
            <Sidebar routes={routes} ref={sidebarRef} />

            {/* Layout principal with left margin for sidebar */}
            <Layout style={{ marginLeft: 64 }}>
                {/* Header */}
                <HeaderComponent
                    searchRef={searchRef}
                    profileRef={profileRef}
                    onRestartTour={handleRestartTour}
                />

                {/* Contenido de las rutas hijas */}
                <Content
                    style={{
                        minHeight: "calc(100vh - 64px)",
                        overflowY: "auto",
                        padding: "24px"
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

const Dashboard = () => (
    <OnboardingProvider>
        <DashboardContent />
    </OnboardingProvider>
);

export default Dashboard;
