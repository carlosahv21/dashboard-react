import React, { useContext, useMemo } from "react";
import { Row, Col, Menu } from "antd";
import { Link, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SettingOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";

import SettingsGeneral from "./Sections/GeneralInformation";
import SettingsActiveModules from "./Sections/ActiveModules";
import SettingsRoles from "./Sections/Roles";
import SettingsPermissions from "./Sections/Permissions";
import SettingsUsers from "./Sections/Users";
import SettingsCustomFields from "./Sections/CustomFields";
import SettingsPayments from "./Sections/Payments";

const componentsMap = {
    "settings.general": SettingsGeneral,
    "settings.activeModules": SettingsActiveModules,
    "settings.roles": SettingsRoles,
    "settings.permissions": SettingsPermissions,
    "settings.users": SettingsUsers,
    "settings.customFields": SettingsCustomFields,
    "settings.payments": SettingsPayments,
};

const iconMap = {
    academySettings: <SettingOutlined />,
    userManagement: <UserOutlined />,
    customization: <SettingOutlined />,
    finance: <DollarOutlined />,
};

const SettingsLayout = () => {
    const { routes } = useContext(AuthContext);
    const location = useLocation();

    const settingsRoutes = useMemo(() => {
        const settings = routes.find(r => r.name === "settings");
        return settings?.children || [];
    }, [routes]);

    // Agrupar por secciones para el menú
    const groups = {
        academySettings: ["general", "activeModules"],
        userManagement: ["roles", "permissions", "users"],
        customization: ["customFields"],
        finance: ["payments"],
    };

    const menuItems = useMemo(() => {
        return Object.entries(groups).map(([groupKey, keys]) => ({
            key: groupKey,
            icon: iconMap[groupKey],
            label: groupKey === "academySettings" ? "Academy Settings" :
                groupKey === "userManagement" ? "User Management" :
                    groupKey === "customization" ? "Customization" :
                        "Finance",
            children: settingsRoutes
                .filter(r => keys.includes(r.path))
                .map(r => ({
                    key: r.path,
                    label: <Link to={r.path}>{r.label}</Link>,
                })),
        }));
    }, [settingsRoutes]);

    const selectedKey = location.pathname.split("/").pop() || "general";

    return (
        <Row gutter={24}>
            <Col span={6}>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={[menuItems[0]?.key]}
                    style={{
                        height: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    items={menuItems}
                />
            </Col>
            <Col span={18}>
                <div
                    style={{
                        padding: "24px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Routes>
                        {settingsRoutes.map(r => {
                            const Component = componentsMap[r.name];
                            return <Route key={r.id} path={r.path} element={<Component />} />;
                        })}
                        <Route path="*" element={<Navigate to="general" replace />} />
                    </Routes>
                </div>
            </Col>
        </Row>
    );
};

export default SettingsLayout;
