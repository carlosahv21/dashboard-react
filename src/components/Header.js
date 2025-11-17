import React, { useContext } from "react";
import { Button, Layout, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const { Header } = Layout;

const HeaderComponent = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.clear();   // Limpia toda la sesión
        logout();               // Actualiza el estado global del AuthContext
        navigate("/login");     // Redirección
    };

    const menuItems = [
        {
            key: "settings",
            label: "Settings",
            onClick: () => navigate("/settings"),
        },
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
                style={{ fontSize: 18, width: 64, height: 64 }}
            />

            <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={["click"]}
            >
                <Button
                    type="text"
                    icon={<SettingFilled />}
                    style={{ fontSize: 18, width: 64, height: 64, marginRight: 20 }}
                />
            </Dropdown>
        </Header>
    );
};

export default HeaderComponent;
