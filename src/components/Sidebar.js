import React, { useContext } from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from "@ant-design/icons";
import { SettingsContext } from "../context/SettingsContext"; // Importa el contexto de settings

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const { settings } = useContext(SettingsContext);

  // Obtener la URL base del .env
  const baseBackend = process.env.REACT_APP_BACKEND;

  const logo = baseBackend +'/'+ settings.logo_url;

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div
        className="logo"
        style={{
          height: collapsed ? 32 : 'auto',
          margin: collapsed ? 8 : 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Mostrar el logo si está disponible en los settings */}
        {settings && settings.logo_url && (
          <a rel="noopener noreferrer" href="/dashboard">
            <img
              // Concatenar el baseUrl con el logo_url que viene de los settings
              src={logo}
              alt="Logo"
              style={{
                width: collapsed ? "30px" : "120px",
                height: "auto",
                transition: "width 0.2s ease",
              }}
            />
          </a>
        )}
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1" icon={<UserOutlined />}>
          nav 1
        </Menu.Item>
        <Menu.Item key="2" icon={<VideoCameraOutlined />}>
          nav 2
        </Menu.Item>
        <Menu.Item key="3" icon={<UploadOutlined />}>
          nav 3
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
