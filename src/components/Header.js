import React, { useContext } from "react";
import { Button, Layout, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingFilled } from "@ant-design/icons";
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
        localStorage.removeItem("settings");

        setIsAuthenticated(false);
        navigate("/login");
    };

    // Convierte las rutas en el formato requerido por Ant Design
    const userMenuItems = [
        ...headerRoutes.map(route => ({
            key: route.id,
            label: route.name,
            onClick: () => {
                if (route.on_click_action === "logout") {
                    handleLogout();
                } else {
                    handleMenuClick(route);
                }
            },
        })),
        {
            key: "logout",
            label: "Logout",
            onClick: handleLogout,
        },
    ];

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
            <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
            >
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
