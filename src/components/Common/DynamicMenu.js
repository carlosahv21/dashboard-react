import React from "react";
import { Menu } from "antd";
import * as Icons from "@ant-design/icons";

const DynamicMenu = ({ routes, theme, onMenuClick }) => {
    const getIcon = (iconName) => {
        const IconComponent = Icons[`${iconName}Outlined`];
        return IconComponent ? <IconComponent /> : <Icons.QuestionOutlined />;
    };

    return (
        <Menu theme={theme} mode="inline">
            {routes.map((route) => (
                <Menu.Item key={route.id} icon={getIcon(route.icon)} onClick={() => onMenuClick(route)}>
                    {route.name}
                </Menu.Item>
            ))}
        </Menu>
    );
};

export default DynamicMenu;
