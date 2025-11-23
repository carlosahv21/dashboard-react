import React, { useContext } from "react";
import { Layout, Menu } from "antd";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as Icons from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const { settings, routes, hasPermission } = useContext(AuthContext); // ← obtener hasPermission
  const navigate = useNavigate();

  const getIcon = (iconName) => {
    if (!iconName) return <Icons.QuestionOutlined />;
    const IconComponent = Icons[`${iconName}Outlined`] || Icons[iconName] || Icons.QuestionOutlined;
    return <IconComponent />;
  };

  // Filtrar rutas que van al menú
  const menuRoutes = routes.filter(r => r.is_menu === 1);

  // Convertir estructura del backend → estructura del Menu de Ant Design
  const buildMenuItems = (routeList) =>
    routeList
      .filter(r => !r.permission || hasPermission(r.permission)) // ← solo incluir si no requiere permiso o si tiene permiso
      .map((r) => {
        const hasChildren = r.children && r.children.length > 0;

        return {
          key: r.id,
          icon: getIcon(r.icon),
          label: r.label || "No Label",
          children: hasChildren
            ? buildMenuItems(r.children.filter(c => c.is_menu === 1))
            : undefined,
          onClick: () => {
            if (!hasChildren) navigate(r.full_path);
          },
        };
      });

  const items = buildMenuItems(menuRoutes);

  const baseBackend = process.env.REACT_APP_BACKEND;
  const logo = baseBackend + "/" + (settings?.logo_url || "");

  return (
    <Sider theme={settings?.theme || "light"} collapsible collapsed={collapsed}>
      <div
        className="logo"
        style={{
          height: collapsed ? 40 : "auto",
          margin: collapsed ? 8 : 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {settings?.logo_url && (
          <a href="/">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: collapsed ? "40px" : "120px",
                height: "auto",
                transition: "width 0.2s ease",
              }}
            />
          </a>
        )}
      </div>

      <Menu theme={settings?.theme || "light"} mode="inline" items={items} />
    </Sider>
  );
};

export default Sidebar;
