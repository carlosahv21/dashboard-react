import React from "react";
import { Button, Layout, Dropdown, Menu } from "antd";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const { Header } = Layout;

const HeaderComponent = ({ collapsed, setCollapsed, setIsAuthenticated }) => {
    const navigate = useNavigate(); // Hook para redireccionar

    // Función de logout
    const handleLogout = () => {
        localStorage.removeItem("token"); // Quitar el token del localStorage
        setIsAuthenticated(false); // Cambiar el estado de autenticación a 'false'
        navigate("/login"); // Redireccionar al login
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => navigate("/dashboard/settings")}>
                Settings
            </Menu.Item>
            <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header
            style={{
                padding: 0,
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                }}
            />
            <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
                <Button
                    type="text"
                    icon={<UserOutlined />}
                    style={{
                        fontSize: "16px",
                        width: 64,
                        height: 64,
                        marginRight: 15,
                    }}
                />
            </Dropdown>
        </Header>
    );
};

export default HeaderComponent;
