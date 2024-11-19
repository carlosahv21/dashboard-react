import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";
import { Form, Row, Col, message, Menu } from "antd";
import { SettingOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch";

// Importar los componentes de las secciones
import GeneralInformation from "./Sections/GeneralInformation.js";
import Roles from "./Sections/Roles";
import Profiles from "./Sections/Profiles";
import ActiveModules from "./Sections/ActiveModules";
import Users from "./Sections/Users";
import Payments from "./Sections/Payments";
import CustomFields from "./Sections/CustomFields";

const { SubMenu } = Menu;

const Settings = () => {
    const [form] = Form.useForm();
    const { setSettings } = useContext(SettingsContext);
    const { request, error } = useFetch();
    const [activeSection, setActiveSection] = useState("general");

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const fetchedSettings = await request("settings", "GET");
                setSettings(fetchedSettings);
                form.setFieldsValue(fetchedSettings);
            } catch {
                message.error(error || "Failed to fetch settings.");
            }
        };

        loadSettings();
    }, [request, form, setSettings, error]);

    const renderContent = () => {
        switch (activeSection) {
            case "general":
                return <GeneralInformation />;
            case "roles":
                return <Roles />;
            case "profiles":
                return <Profiles />;
            case "activeModules":
                return <ActiveModules />;
            case "users":
                return <Users />;
            case "payments":
                return <Payments />;
            case "customFields":
                return <CustomFields />;
            default:
                return <div>Select a section from the menu.</div>;
        }
    };

    return (
        <Row gutter={24}>
            <Col span={6}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={["general"]}
                    defaultOpenKeys={["academySettings"]}
                    onClick={(e) => setActiveSection(e.key)}
                    style={{
                        height: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <SubMenu key="academySettings" icon={<SettingOutlined />} title="Academy Settings">
                        <Menu.Item key="general">General Information</Menu.Item>
                        <Menu.Item key="activeModules">Active Modules</Menu.Item>
                    </SubMenu>
                    <SubMenu key="userManagement" icon={<UserOutlined />} title="User Management">
                        <Menu.Item key="roles">Roles</Menu.Item>
                        <Menu.Item key="profiles">Profiles</Menu.Item>
                        <Menu.Item key="users">Users</Menu.Item>
                    </SubMenu>
                    <SubMenu key="customization" icon={<SettingOutlined />} title="Customization">
                        <Menu.Item key="customFields">Custom Fields</Menu.Item>
                    </SubMenu>
                    <SubMenu key="finance" icon={<DollarOutlined />} title="Finance">
                        <Menu.Item key="payments">Payments</Menu.Item>
                    </SubMenu>
                </Menu>
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
                    {renderContent()}
                </div>
            </Col>
        </Row>
    );
};

export default Settings;
