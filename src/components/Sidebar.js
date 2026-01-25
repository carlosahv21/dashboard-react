import React, { useContext, forwardRef } from "react";
import { Layout, Menu, Tooltip, Switch } from "antd";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "@ant-design/icons";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Sider } = Layout;

const Sidebar = forwardRef((props, ref) => {
	const { settings, hasPermission, toggleTheme } = useContext(AuthContext);
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

	const staticMenuDefinition = [
		{
			label: t("menu.dashboard"),
			icon: "Dashboard",
			path: "/",
			permissionRequired: "dashboard:view",
		},
		{
			label: t("menu.plans"),
			icon: "SolutionOutlined",
			path: "/plans",
			permissionRequired: "plans:view",
		},
		{
			label: t("menu.classes"),
			icon: "Read",
			path: "/classes",
			permissionRequired: "classes:view",
		},
		{
			label: t("menu.students"),
			icon: "Team",
			path: "/students",
			permissionRequired: "students:view",
		},
		{
			label: t("menu.teachers"),
			icon: "IdcardOutlined",
			path: "/teachers",
			permissionRequired: "teachers:view",
		},
		{
			label: t("menu.registrations"),
			icon: "UserAddOutlined",
			path: "/registrations",
			permissionRequired: "registrations:view",
		},
		{
			label: t("menu.attendances"),
			icon: "CalendarOutlined",
			path: "/attendances",
			permissionRequired: "attendances:view",
		},
	];

	const buildMenuItems = (menuDefinition) =>
		menuDefinition
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

	const logo = "/logo-" + (settings?.theme || "light") + ".png";

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
						src={logo}
						alt="Logo"
						style={{
							width: "4rem",
							paddingTop: "0.5rem",
							height: "auto",
							transition: "width 0.2s ease",
						}}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src =
								"https://placehold.co/40x40/0A84FF/ffffff?text=L";
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
