import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

export const useAchievementColumns = () => {
    const { t } = useTranslation();

    const categoryColors = {
        attendance: "green",
        performance: "blue",
        social: "purple",
        milestone: "gold",
        special: "magenta",
    };

    const columns = [
        {
            title: t("global.name"),
            dataIndex: "name",
            key: "name",
            sorter: true,
            defaultSortOrder: "ascend",
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: t("global.description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: t("achievements.category"),
            dataIndex: "category",
            key: "category",
            sorter: true,
            render: (category) => (
                <Tag color={categoryColors[category] || "default"}>{category}</Tag>
            ),
        },
        {
            title: t("achievements.pointsReward"),
            dataIndex: "points_reward",
            key: "points_reward",
            sorter: true,
            align: "center",
            render: (points) => <span style={{ fontWeight: 500 }}>{points}</span>,
        },
    ];

    return columns;
};
