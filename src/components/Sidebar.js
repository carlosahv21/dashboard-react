import React, { useContext } from "react";
import { Layout, Menu } from "antd";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as Icons from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
	const { settings, hasPermission } = useContext(AuthContext);
	const navigate = useNavigate();

	const getIcon = (iconName) => {
		if (!iconName) return <Icons.QuestionOutlined />;
		const IconComponent = Icons[`${iconName}Outlined`] || Icons[iconName] || Icons.QuestionOutlined;
		return <IconComponent />;
	};

	const staticMenuDefinition = [
		{
			label: "Dashboard",
			icon: "Dashboard",
			path: "/",
			permissionRequired: "dashboard:view",
		},
		{
			label: "Planes",
			icon: "SolutionOutlined",
			path: "/plans",
			permissionRequired: "plans:view",
		},
		{
			label: "Clases",
			icon: "Read",
			path: "/classes",
			permissionRequired: "classes:view",
		},
		{
			label: "Estudiantes",
			icon: "Team",
			path: "/students",
			permissionRequired: "students:view",
		},
		{
			label: "Profesores",
			icon: "IdcardOutlined",
			path: "/teachers",
			permissionRequired: "teachers:view",
		},
		{
			label: "Inscripciones",
			icon: "UserAddOutlined",
			path: "/registrations",
			permissionRequired: "registrations:view",
		},
		{
			label: "Asistencias",
			icon: "CalendarOutlined",
			path: "/attendances",
			permissionRequired: "attendances:view",
		},
	];

	const buildMenuItems = (menuDefinition) =>
		menuDefinition
			.filter(item => hasPermission(item.permissionRequired))
			.map((item) => {
				const hasChildren = item.children && item.children.length > 0;

				return {
					key: item.path,
					icon: getIcon(item.icon),
					label: item.label,
					children: hasChildren
						? buildMenuItems(item.children)
						: undefined,
					onClick: () => {
						if (!hasChildren) navigate(item.path);
					},
				};
			})
			.filter(item => !item.children || (item.children && item.children.length > 0));


	const items = buildMenuItems(staticMenuDefinition);

	const logo = settings?.logo_url;

	return (
		<Sider theme={settings?.theme || "light"} trigger={null} collapsible collapsed={collapsed}>
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
							onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x40/cccccc/333333?text=Logo"; }}
						/>
					</a>
				)}
			</div>

			<Menu theme={settings?.theme || "light"} mode="inline" items={items} />
		</Sider>
	);
};

export default Sidebar;