// components/Sidebar.js
import React, { useContext } from "react";
import { Layout } from "antd";
import DynamicMenu from "./Subcomponents/DynamicMenu";
import { SettingsContext } from "../context/SettingsContext";
import { RoutesContext } from "../context/RoutesContext";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const { settings } = useContext(SettingsContext);
  const { routes } = useContext(RoutesContext);
  const navigate = useNavigate();

  const baseBackend = process.env.REACT_APP_BACKEND;
  const logo = baseBackend + '/' + settings.logo_url;

  const sidebarRoutes = routes.filter(route => route.location === 'SIDEBAR');

  const handleMenuClick = (route) => {
    if (route.on_click_action === 'navigate') {
      navigate(route.path);
    }
  };

  return (
    <Sider theme={settings.theme} trigger={null} collapsible collapsed={collapsed}>
      <div className="logo" style={{ height: collapsed ? 32 : 'auto', margin: collapsed ? 8 : 16, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
        {settings.logo_url && (
          <a href="/dashboard">
            <img src={logo} alt="Logo" style={{ width: collapsed ? "30px" : "120px", height: "auto", transition: "width 0.2s ease" }} />
          </a>
        )}
      </div>
      <DynamicMenu routes={sidebarRoutes} theme={settings.theme} onMenuClick={handleMenuClick} />
    </Sider>
  );
};

export default Sidebar;
