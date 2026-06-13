import { useTranslation } from "react-i18next";
import { Tag, Typography, Space, Switch } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const useChallengeColumns = () => {
    const { t } = useTranslation();

    const typeColors = {
        attendance: "green",
        performance: "blue",
        social: "purple",
        special: "magenta",
    };

    const columns = [
        {
            title: t("global.title"),
            dataIndex: "title",
            key: "title",
            sorter: true,
            defaultSortOrder: "ascend",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: "14px" }}>{text}</Text>
                    {record.description && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {record.description}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: t("challenges.challengeType"),
            dataIndex: "challenge_type",
            key: "challenge_type",
            sorter: true,
            render: (type) => (
                <Tag color={typeColors[type] || "default"}>
                    <ThunderboltOutlined style={{ marginRight: 4 }} />
                    {type}
                </Tag>
            ),
        },
        {
            title: t("challenges.goalValue"),
            dataIndex: "goal_value",
            key: "goal_value",
            sorter: true,
            align: "center",
        },
        {
            title: t("challenges.startDate"),
            dataIndex: "start_date",
            key: "start_date",
            sorter: true,
            render: (date) => date ? new Date(date).toLocaleDateString() : "-",
        },
        {
            title: t("challenges.endDate"),
            dataIndex: "end_date",
            key: "end_date",
            sorter: true,
            render: (date) => date ? new Date(date).toLocaleDateString() : "-",
        },
        {
            title: t("challenges.pointsReward"),
            dataIndex: "points_reward",
            key: "points_reward",
            sorter: true,
            align: "center",
            render: (points) => <span style={{ fontWeight: 500 }}>{points}</span>,
        },
        {
            title: t("challenges.isActive"),
            dataIndex: "is_active",
            key: "is_active",
            align: "center",
            render: (active) => (
                <Switch checked={active} disabled size="small" />
            ),
        },
    ];

    return columns;
};
