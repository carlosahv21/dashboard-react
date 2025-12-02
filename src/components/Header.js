import React, { useContext, useMemo } from "react";
import { Button, Layout, Dropdown, Avatar, Space, Badge } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    MessageOutlined,
    DownOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const { Header } = Layout;

const isPlanVigent = (plan) => {
    if (!plan || plan.plan_status !== 'active') return false;

    const startDate = new Date(plan.plan_start_date);
    const endDate = new Date(plan.plan_end_date);
    const now = new Date();
    return now >= startDate && now <= endDate;
};


const HeaderComponent = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const { logout, hasPermission, user } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.clear();
        logout();
    };

    const { classesAvailable, isPlanActiveAndVigent } = useMemo(() => {
        const plan = user?.plan;

        let available = 0;
        let activeAndVigent = false;

        if (plan) {
            activeAndVigent = isPlanVigent(plan);
            console.log(activeAndVigent);

            if (activeAndVigent) {
                available = Math.max(0, plan.max_sessions - plan.plan_classes_used);
            }
        }

        return { classesAvailable: available, isPlanActiveAndVigent: activeAndVigent };
    }, [user?.plan]);


    const allMenuItems = [
        {
            key: "settings",
            label: "Configuración",
            permission: "settings:view",
            icon: <SettingOutlined />,
            onClick: () => navigate("/settings"),
        },
        {
            key: "logout",
            label: "Cerrar sesión",
            danger: true,
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <Header
            style={{
                padding: "0",
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

            <Space style={{ marginRight: 20, fontSize: 18 }} size={24}>

                {user?.plan && (
                    <div
                        title={isPlanActiveAndVigent ? `Te quedan ${classesAvailable} clases de tu plan.` : 'Tu plan ha expirado o está inactivo.'}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: isPlanActiveAndVigent ? '#e6f7ff' : '#fff1f0', 
                            borderRadius: '4px',
                            border: `1px solid ${isPlanActiveAndVigent ? '#91d5ff' : '#ffa39e'}`,
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: '20px',
                            cursor: 'default',
                        }}
                    >
                        Clases Disp:
                        <span style={{
                            marginLeft: 5,
                            color: classesAvailable > 0 ? '#52c41a' : (isPlanActiveAndVigent ? '#faad14' : '#f5222d'), 
                            fontSize: 16,
                        }}>
                            {classesAvailable}
                        </span>
                    </div>
                )}

                <Badge count={0} size="small">
                    <MessageOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                </Badge>

                <Badge count={3} size="small">
                    <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                </Badge>

                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <Space style={{ cursor: "pointer" }}>
                        <Avatar size="large" icon={<UserOutlined />} />

                        <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                                {user?.name || "Usuario"}
                            </span>
                            <span style={{ fontSize: 12, color: "#888" }}>
                                {user?.email}
                            </span>
                        </div>

                        <DownOutlined style={{ fontSize: 12 }} />
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default HeaderComponent;