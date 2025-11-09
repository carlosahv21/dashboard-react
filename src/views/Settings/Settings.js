import React, { lazy, Suspense, useContext, useEffect } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { Form, Row, Col, Menu } from "antd";
import { SettingOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";
import { Routes, Route, Link, Outlet } from "react-router-dom"; // Importa sin BrowserRouter

// Lazy loading de las secciones
const GeneralInformation = lazy(() => import("./Sections/GeneralInformation"));
const Roles = lazy(() => import("./Sections/Roles"));
const Profiles = lazy(() => import("./Sections/Profiles"));
const ActiveModules = lazy(() => import("./Sections/ActiveModules"));
const Users = lazy(() => import("./Sections/Users"));
const Payments = lazy(() => import("./Sections/Payments"));
const CustomFields = lazy(() => import("./Sections/CustomFields"));

const { SubMenu } = Menu;

const SettingsLayout = () => {
    const [form] = Form.useForm();
    const { setSettings } = useContext(SettingsContext);

    useEffect(() => {
        // Puedes manejar aquí cualquier efecto necesario
    }, [form, setSettings]);

    return (
        <Row gutter={24}>
            <Col span={6}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={["general"]}
                    defaultOpenKeys={["academySettings"]}
                    style={{
                        height: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    items={[
                        {
                            key: "academySettings",
                            icon: <SettingOutlined />,
                            label: "Academy Settings",
                            children: [
                                {
                                    key: "general",
                                    label: <Link to="general">General Information</Link>,
                                },
                                {
                                    key: "activeModules",
                                    label: <Link to="activeModules">Active Modules</Link>,
                                },
                            ],
                        },
                        {
                            key: "userManagement",
                            icon: <UserOutlined />,
                            label: "User Management",
                            children: [
                                { key: "roles", label: <Link to="roles">Roles</Link> },
                                { key: "profiles", label: <Link to="profiles">Profiles</Link> },
                                { key: "users", label: <Link to="users">Users</Link> },
                            ],
                        },
                        {
                            key: "customization",
                            icon: <SettingOutlined />,
                            label: "Customization",
                            children: [
                                { key: "customFields", label: <Link to="customFields">Custom Fields</Link> },
                            ],
                        },
                        {
                            key: "finance",
                            icon: <DollarOutlined />,
                            label: "Finance",
                            children: [
                                { key: "payments", label: <Link to="payments">Payments</Link> },
                            ],
                        },
                    ]}
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
                    <Suspense fallback={<div>Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </div>
            </Col>
        </Row>
    );
};

const Settings = () => (
    <Routes>
        <Route path="/*" element={<SettingsLayout />}>
            <Route
                index
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <GeneralInformation />
                    </Suspense>
                }
            />
            <Route
                path="general"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <GeneralInformation />
                    </Suspense>
                }
            />
            <Route
                path="roles"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Roles />
                    </Suspense>
                }
            />
            <Route
                path="profiles"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Profiles />
                    </Suspense>
                }
            />
            <Route
                path="activeModules"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <ActiveModules />
                    </Suspense>
                }
            />
            <Route
                path="users"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Users />
                    </Suspense>
                }
            />
            <Route
                path="payments"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <Payments />
                    </Suspense>
                }
            />
            <Route
                path="customFields"
                element={
                    <Suspense fallback={<div>Loading...</div>}>
                        <CustomFields />
                    </Suspense>
                }
            />
        </Route>
    </Routes>
);

export default Settings;
