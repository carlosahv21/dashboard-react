import React, { useContext } from "react";
import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import HeaderComponent from "../../components/Header";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const { Content } = Layout;

const Dashboard = () => {
    const { routes } = useContext(AuthContext);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Fixed Sidebar */}
            <Sidebar routes={routes} />

            {/* Layout principal with left margin for sidebar */}
            <Layout style={{ marginLeft: 64 }}>
                {/* Header */}
                <HeaderComponent />

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

export default Dashboard;
