// components/HeaderComponent.js
import React, { useContext } from "react";
import { Button, Layout, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingFilled } from "@ant-design/icons";
import DynamicMenu from "./Common/DynamicMenu";
import { RoutesContext } from "../context/RoutesContext";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const HeaderComponent = ({ collapsed, setCollapsed, setIsAuthenticated }) => {
    const { routes } = useContext(RoutesContext);
    const navigate = useNavigate();

    const headerRoutes = routes.filter(route => route.location === "HEADER");

    const handleMenuClick = (route) => {
        if (route.on_click_action === "navigate") {
            navigate(route.path);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/login");
    };

    const userMenu = (
        <DynamicMenu routes={[...headerRoutes, { id: "logout", name: "Logout", icon: "Logout", on_click_action: "logout" }]} theme="light" onMenuClick={(route) => {
            if (route.on_click_action === "logout") {
                handleLogout();
            } else {
                handleMenuClick(route);
            }
        }} />
    );

    return (
        <Header
            style={{
                padding: 0,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: "18px",
                    width: 64,
                    height: 64,
                }}
            />
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
                <Button
                    type="text"
                    icon={<SettingFilled />}
                    style={{
                        fontSize: "18px",
                        width: 64,
                        height: 64,
                        marginRight: 20,
                    }}
                />
            </Dropdown>
        </Header>
    );
};

export default HeaderComponent;
