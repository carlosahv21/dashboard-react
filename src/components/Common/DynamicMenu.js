import React from "react";
import { Menu } from "antd";
import * as Icons from "@ant-design/icons";

const DynamicMenu = ({ routes, theme, onMenuClick }) => {
    const getIcon = (iconName) => {
        const IconComponent = Icons[`${iconName}Outlined`];
        return IconComponent ? <IconComponent /> : <Icons.QuestionOutlined />;
    };

    return (
        <Menu
            theme={theme}
            mode="inline"
            items={routes.map((route) => ({
                key: route.id,
                icon: getIcon(route.icon),
                label: route.name,
                onClick: () => onMenuClick(route),
            }))}
        />

    );
};

export default DynamicMenu;
