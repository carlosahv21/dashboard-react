import React from "react";
import { Menu } from "antd";
import * as Icons from "@ant-design/icons";

const DynamicMenu = ({ routes, theme, onMenuClick }) => {
    const getIcon = (iconName) => {
        const IconComponent = Icons[`${iconName}Outlined`];
        return IconComponent ? <IconComponent style={{ fontSize: '20px' }} /> : <Icons.QuestionOutlined style={{ fontSize: '20px' }} />;
    };

    return (
        <Menu theme={theme} mode="inline" style={{ fontSize: '18px'}}>
            {routes.map((route) => (
                <Menu.Item key={route.id} icon={getIcon(route.icon)} onClick={() => onMenuClick(route)}>
                    {route.name}
                </Menu.Item>
            ))}
        </Menu>
    );
};

export default DynamicMenu;
