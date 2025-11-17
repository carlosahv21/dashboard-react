import React, { useState, useContext } from "react";
import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import HeaderComponent from "../../components/Header";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const { Content } = Layout;

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { routes } = useContext(AuthContext);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar collapsed={collapsed} routes={routes} />

            {/* Layout principal */}
            <Layout>
                {/* Header */}
                <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

                {/* Contenido de las rutas hijas */}
                <Content
                    style={{
                        padding: 24,
                        minHeight: 280
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
