import React, { useState } from "react";
import { Layout } from "antd";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import HeaderComponent from "../components/Header";
import { Outlet } from "react-router-dom"; // Outlet para renderizar las rutas hijas

const { Content } = Layout;

const Dashboard = ({ setIsAuthenticated }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} />
            <Layout>
                <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} setIsAuthenticated={setIsAuthenticated} />
                <Content
                    style={{
                        margin: "20px 16px",
                        padding: 24,
                        minHeight: 280,
                        borderRadius: 8,
                    }}
                >
                    {/* Aquí se renderizan las rutas hijas */}
                    <Outlet />
                </Content>
                <Footer />
            </Layout>
        </Layout>
    );
};

export default Dashboard;
