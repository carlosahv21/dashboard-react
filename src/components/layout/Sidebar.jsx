import React, { useContext, forwardRef } from "react";
import { Layout, Menu, Tooltip, Switch } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "@ant-design/icons";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Sider } = Layout;

const Sidebar = forwardRef((props, ref) => {
	const { settings, academy, hasPermission, hasModule, toggleTheme } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	const isDarkMode = settings?.theme === "dark";

	const getIcon = (iconName) => {
		if (!iconName) return <Icons.QuestionOutlined />;
		const IconComponent =
			Icons[`${iconName}Outlined`] || Icons[iconName] || Icons.QuestionOutlined;
		return <IconComponent />;
	};

	/**
	 * Menu definition.
	 * - `module`: must match a key in the backend `modules` array to be shown.
	 * - `permissionRequired`: "module:action" permission string for role-based filtering.
	 */
	const staticMenuDefinition = [
		{
			label: t("menu.dashboard"),
			icon: "Dashboard",
			path: "/",
			module: "dashboard",
			permissionRequired: "dashboard:view",
		},
		{
			label: t("menu.plans"),
			icon: "SolutionOutlined",
			path: "/plans",
			module: "plans",
			permissionRequired: "plans:view",
		},
		{
			label: t("menu.classes"),
			icon: "Read",
			path: "/classes",
			module: "classes",
			permissionRequired: "classes:view",
		},
		{
			label: t("menu.students"),
			icon: "Team",
			path: "/students",
			module: "students",
			permissionRequired: "students:view",
		},
		{
			label: t("menu.teachers"),
			icon: "IdcardOutlined",
			path: "/teachers",
			module: "teachers",
			permissionRequired: "teachers:view",
		},
		{
			label: t("menu.registrations"),
			icon: "UserAddOutlined",
			path: "/registrations",
			module: "registrations",
			permissionRequired: "registrations:view",
		},
		{
			label: t("menu.attendances"),
			icon: "CalendarOutlined",
			path: "/attendances",
			module: "attendances",
			permissionRequired: "attendances:view",
		}
	];

	const buildMenuItems = (menuDefinition) =>
		menuDefinition
			// 1. Filter by backend modules array (multitenant: only enabled modules)
			.filter((item) => !item.module || hasModule(item.module))
			// 2. Filter by role permissions
			.filter((item) => hasPermission(item.permissionRequired))
			.map((item) => {
				const hasChildren = item.children && item.children.length > 0;

				return {
					key: item.path,
					icon: getIcon(item.icon),
					label: item.label,
					children: hasChildren ? buildMenuItems(item.children) : undefined,
					onClick: () => {
						if (!hasChildren) navigate(item.path);
					},
				};
			})
			.filter(
				(item) => !item.children || (item.children && item.children.length > 0)
			);

	const items = buildMenuItems(staticMenuDefinition);

	// Prefer the academy logo from the backend; fall back to theme-based static asset.
	const logoSrc = academy?.logo_url || `/logo-${settings?.theme || "light"}.png`;

	return (
		<Sider
			ref={ref}
			theme={settings?.theme || "light"}
			trigger={null}
			collapsible
			collapsed={true}
			width={64}
			collapsedWidth={64}
			style={{
				overflow: "hidden",
				height: "100vh",
				position: "fixed",
				left: 0,
				top: 0,
				bottom: 0,
			}}
		>
			<div
				className="logo"
				style={{
					height: 64,
					margin: 1,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					overflow: "hidden",
				}}
			>
				<a href="/">
					<img
						src={logoSrc}
						alt={academy?.name || "Logo"}
						style={{
							width: "4rem",
							paddingTop: "0.5rem",
							height: "auto",
							transition: "width 0.2s ease",
						}}
						onError={(e) => {
							e.target.onerror = null;
							// Academy initial as fallback when both logo_url and static asset fail
							const initial = encodeURIComponent(
								(academy?.name || "L").charAt(0).toUpperCase()
							);
							e.target.src = `https://placehold.co/40x40/0A84FF/ffffff?text=${initial}`;
						}}
					/>
				</a>
			</div>

			<Menu
				theme={settings?.theme || "light"}
				mode="inline"
				items={items}
				inlineCollapsed={true}
				selectedKeys={[location.pathname]}
				style={{
					height: "calc(100vh - 128px)",
					borderRight: 0,
					overflowY: "auto",
				}}
			/>

			{/* Theme Toggle at Bottom */}
			<div
				style={{
					position: "absolute",
					bottom: 0,
					width: "100%",
					padding: "16px 0",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					borderTop: `1px solid ${isDarkMode ? "#2D2D2D" : "#E0E0E0"}`,
				}}
			>
				<Tooltip
					title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
					placement="right"
				>
					<Switch
						checked={isDarkMode}
						onChange={toggleTheme}
						checkedChildren={<MoonOutlined />}
						unCheckedChildren={<SunOutlined />}
					/>
				</Tooltip>
			</div>
		</Sider>
	);
});

export default Sidebar;
