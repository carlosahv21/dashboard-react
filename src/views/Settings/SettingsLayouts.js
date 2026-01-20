import React, { useContext, useMemo } from "react";
import { Row, Col, Menu, theme } from "antd";
import { Link, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SettingOutlined, UserOutlined, DollarOutlined, AppstoreAddOutlined, DeleteOutlined } from "@ant-design/icons";

import SettingsGeneral from "./Sections/GeneralInformation";
import SettingsActiveModules from "./Sections/ActiveModules";
import SettingsRoles from "./Sections/Roles";
import SettingsPermissions from "./Sections/Permissions";
import SettingsUsers from "./Sections/Users";
import SettingsCustomFields from "./Sections/CustomFields";
import SettingsPayments from "./Sections/Payments";
import SettingsRecycleBin from "./Sections/RecycleBin";

const componentsMap = {
    "settings.general": SettingsGeneral,
    "settings.activeModules": SettingsActiveModules,
    "settings.roles": SettingsRoles,
    "settings.permissions": SettingsPermissions,
    "settings.users": SettingsUsers,
    "settings.customFields": SettingsCustomFields,
    "settings.payments": SettingsPayments,
    "settings.recycle_bin": SettingsRecycleBin,
};

const staticSettingsSections = [
    { path: "general", label: "Información General", name: "settings.general", permission: "settings:view", group: "academySettings" },
    { path: "roles", label: "Roles", name: "settings.roles", permission: "roles:view", group: "userManagement" },
    { path: "permissions", label: "Permisos", name: "settings.permissions", permission: "permissions:view", group: "userManagement" },
    { path: "users", label: "Usuarios", name: "settings.users", permission: "users:view", group: "userManagement" },
    { path: "customFields", label: "Campos Personalizados", name: "settings.customFields", permission: "fields:view", group: "customization" },
    { path: "payments", label: "Historial de Pagos", name: "settings.payments", permission: "settings:view", group: "finance" },
    { path: "recycle_bin", label: "Papelera de Reciclaje", name: "settings.recycle_bin", group: "recycle_bin", permission: "recycle_bin:view" },
];

const iconMap = {
    academySettings: <SettingOutlined />,
    userManagement: <UserOutlined />,
    customization: <AppstoreAddOutlined />,
    finance: <DollarOutlined />,
    recycle_bin: <DeleteOutlined />,
};

const menuGroups = [
    { key: "academySettings", label: "Configuración de Academia" },
    { key: "userManagement", label: "Gestión de Usuarios" },
    { key: "customization", label: "Personalización" },
    { key: "finance", label: "Finanzas" },
    { key: "recycle_bin", label: "Papelera de Reciclaje", isLeaf: true },
];


const SettingsLayout = () => {
    const { hasPermission } = useContext(AuthContext);
    const location = useLocation();
    const { token } = theme.useToken();

    const settingsRoutes = useMemo(() => {
        return staticSettingsSections.filter(r => hasPermission(r.permission));
    }, [hasPermission]);
    const menuItems = useMemo(() => {
        const items = [];

        menuGroups.forEach((group, index) => {
            const childrenRoutes = settingsRoutes.filter(r => r.group === group.key);

            if (childrenRoutes.length === 0) {
                return;
            }

            // Add divider before recycle_bin
            if (group.key === "recycle_bin" && items.length > 0) {
                items.push({ type: 'divider' });
            }

            if (group.isLeaf && childrenRoutes.length > 0) {
                const route = childrenRoutes[0];
                items.push({
                    key: route.path,
                    icon: iconMap[group.key],
                    label: <Link to={route.path}>{group.label}</Link>,
                });
            } else {
                items.push({
                    key: group.key,
                    icon: iconMap[group.key],
                    label: group.label,
                    children: childrenRoutes.map(r => ({
                        key: r.path,
                        label: <Link to={r.path}>{r.label}</Link>,
                    })),
                });
            }
        });

        return items;
    }, [settingsRoutes]);

    const selectedKey = location.pathname.split("/").pop() || (settingsRoutes[0]?.path || "general");
    const defaultOpenKey = menuItems[0]?.key;


    return (
        <Row gutter={24}>
            <Col span={6}>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={[defaultOpenKey]}
                    style={{
                        height: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        backgroundColor: token.colorBgContainer,
                    }}
                    items={menuItems}
                />
            </Col>
            <Col span={18}>
                <div
                    style={{
                        padding: "24px",
                        backgroundColor: token.colorBgContainer, // Usar token
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Routes>
                        {settingsRoutes.map(r => {
                            const Component = componentsMap[r.name];
                            if (!Component) return null;

                            return <Route key={r.name} path={r.path} element={<Component />} />;
                        })}
                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to={settingsRoutes[0]?.path || "general"}
                                    replace
                                />
                            }
                        />
                    </Routes>
                </div>
            </Col>
        </Row>
    );
};

export default SettingsLayout;