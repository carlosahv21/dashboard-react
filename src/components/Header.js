import React, { useContext, useMemo, useState, useEffect } from "react";
import { Layout, Dropdown, Avatar, Space, Badge, Input } from "antd";
import {
    BellOutlined,
    MessageOutlined,
    DownOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const { Header } = Layout;

const isPlanVigent = (plan) => {
    if (!plan || plan.plan_status !== "active") return false;

    const startDate = new Date(plan.plan_start_date);
    const endDate = new Date(plan.plan_end_date);
    const now = new Date();
    return now >= startDate && now <= endDate;
};

const HeaderComponent = () => {
    const navigate = useNavigate();
    const { logout, hasPermission, user, settings } = useContext(AuthContext);
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();

    const isDarkMode = settings?.theme === "dark";

    // Scroll effect listener
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

            if (activeAndVigent) {
                available = Math.max(0, plan.max_sessions - plan.plan_classes_used);
            }
        }

        return {
            classesAvailable: available,
            isPlanActiveAndVigent: activeAndVigent,
        };
    }, [user?.plan]);

    const allMenuItems = [
        {
            key: "settings",
            label: t("menu.settings"),
            permission: "settings:view",
            icon: <SettingOutlined />,
            onClick: () => navigate("/settings"),
        },
        {
            key: "logout",
            label: t("menu.logout"),
            danger: true,
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const menuItems = allMenuItems.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <Header
            style={{
                padding: "0 24px",
                backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 10,
                backdropFilter: scrolled ? "blur(8px)" : "none",
                borderBottom: `1px solid ${isDarkMode ? "#2D2D2D" : "#E0E0E0"}`,
            }}
        >
            {/* Search Bar */}
            <Input
                placeholder={t("menu.search")}
                suffix={<SearchOutlined />}
                allowClear
                style={{
                    width: 400,
                    borderRadius: 8,
                }}
            />

            <Space style={{ marginRight: 0, fontSize: 18 }} size={24}>
                {user?.plan && (
                    <div
                        title={
                            isPlanActiveAndVigent
                                ? t("menu.studentMessage", { classesAvailable })
                                : t("menu.studentMessageExpired")
                        }
                        style={{
                            padding: "6px 12px",
                            backgroundColor: isPlanActiveAndVigent
                                ? isDarkMode
                                    ? "#0A2540"
                                    : "#e6f7ff"
                                : isDarkMode
                                    ? "#2D0F12"
                                    : "#fff1f0",
                            borderRadius: "4px",
                            border: `1px solid ${isPlanActiveAndVigent ? "#91d5ff" : "#ffa39e"
                                }`,
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: "20px",
                            cursor: "default",
                            color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit",
                        }}
                    >
                        {t("menu.classesAvailable")}:
                        <span
                            style={{
                                marginLeft: 5,
                                color:
                                    classesAvailable > 0
                                        ? "#52c41a"
                                        : isPlanActiveAndVigent
                                            ? "#faad14"
                                            : "#f5222d",
                                fontSize: 16,
                            }}
                        >
                            {classesAvailable}
                        </span>
                    </div>
                )}

                <Badge count={0} size="small">
                    <MessageOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                </Badge>

                <Badge count={3} size="small">
                    <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                </Badge>

                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <Space style={{ cursor: "pointer" }}>
                        <Avatar size="large" icon={<UserOutlined />} />

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                lineHeight: "1.1",
                            }}
                        >
                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                                {user?.name || t("menu.user")}
                            </span>
                            <span style={{ fontSize: 12, color: "#888" }}>{user?.email}</span>
                        </div>

                        <DownOutlined style={{ fontSize: 12 }} />
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default HeaderComponent;
