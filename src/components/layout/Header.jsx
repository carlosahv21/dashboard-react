import React, { useContext, useMemo, useState, useEffect } from "react";
import { Layout, Dropdown, Avatar, Space } from "antd";
import { DownOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

import GlobalSearch from "./components/GlobalSearch";
import NotificationCenter from "./components/NotificationCenter";

const { Header } = Layout;

/**
 * Header Component
 * Refactored and modularized. Logic moved to:
 * - GlobalSearch.jsx: For app-wide search
 * - NotificationCenter.jsx: For notification management
 */
const HeaderComponent = ({ searchRef, profileRef }) => {
    const navigate = useNavigate();
    const { logout, hasPermission, user, settings } = useContext(AuthContext);
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();

    const isDarkMode = settings?.theme === "dark";

    // Scroll effect for visual polish
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        logout();
        navigate("/login");
    };

    // Calculate plan status and classes
    const { classesAvailable, isPlanActiveAndVigent } = useMemo(() => {
        const plan = user?.plan;
        if (!plan || plan.plan_status !== "active") return { classesAvailable: 0, isPlanActiveAndVigent: false };

        const startDate = new Date(plan.plan_start_date);
        const endDate = new Date(plan.plan_end_date);
        const now = new Date();
        const activeAndVigent = now >= startDate && now <= endDate;
        
        const available = activeAndVigent ? Math.max(0, plan.max_sessions - plan.plan_classes_used) : 0;

        return { classesAvailable: available, isPlanActiveAndVigent: activeAndVigent };
    }, [user?.plan]);

    const allMenuItems = [
        { key: "profile", label: t("settings.profile"), icon: <UserOutlined />, onClick: () => navigate("/profile") },
        { key: "settings", label: t("menu.settings"), permission: "settings:view", icon: <SettingOutlined />, onClick: () => navigate("/settings") },
        { type: 'divider' },
        { key: "logout", label: t("menu.logout"), danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
    ];

    const menuItems = allMenuItems.filter(item => !item.permission || hasPermission(item.permission));

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
            <GlobalSearch isDarkMode={isDarkMode} />

            <Space size={24}>
                {user?.plan && (
                    <div style={{
                        padding: "6px 12px",
                        backgroundColor: isPlanActiveAndVigent ? (isDarkMode ? "#0A2540" : "#e6f7ff") : (isDarkMode ? "#2D0F12" : "#fff1f0"),
                        borderRadius: "4px",
                        border: `1px solid ${isPlanActiveAndVigent ? "#91d5ff" : "#ffa39e"}`,
                        fontSize: 14,
                        fontWeight: 500,
                        color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit",
                    }}>
                        {t("menu.classesAvailable")}:
                        <span style={{ marginLeft: 5, color: classesAvailable > 0 ? "#52c41a" : (isPlanActiveAndVigent ? "#faad14" : "#f5222d"), fontSize: 16 }}>
                            {classesAvailable}
                        </span>
                    </div>
                )}

                <NotificationCenter isDarkMode={isDarkMode} />

                <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
                    <Space style={{ cursor: "pointer" }} ref={profileRef}>
                        <Avatar size="large" icon={user?.avatar ? <img src={user.avatar} alt="avatar" /> : <UserOutlined />} />
                        <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name || t("menu.user")}</span>
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
