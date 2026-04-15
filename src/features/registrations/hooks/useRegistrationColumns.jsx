import React from "react";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

const { Text } = Typography;

export const useRegistrationColumns = () => {
    const { t } = useTranslation();
    const { formatDate } = useFormatting();

    return [
        {
            title: t("registrations.student"),
            key: "student",
            render: (_, record) => (
                <Text strong>
                    {record.user_first_name} {record.user_last_name}
                </Text>
            ),
            sorter: true,
            dataIndex: "user_first_name",
        },
        {
            title: t("registrations.class"),
            dataIndex: "class_name",
            key: "class_name",
            sorter: true,
        },
        {
            title: t("registrations.date"),
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => formatDate(date),
            sorter: true,
            defaultSortOrder: "descend",
        },
        {
            title: t("registrations.level"),
            dataIndex: "class_level",
            key: "class_level",
            render: (level) => (
                <Tag color="blue">{level?.toUpperCase()}</Tag>
            ),
        },
        {
            title: t("registrations.genre"),
            dataIndex: "class_genre",
            key: "class_genre",
            render: (genre) => (
                <Tag color="purple">{genre?.toUpperCase()}</Tag>
            ),
        }
    ];
};
