import React from "react";
import { Tag, Typography, Space } from "antd";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

const { Text } = Typography;

export const useRegistrationColumns = (isGroupedByStudent = false) => {
    const { t } = useTranslation();
    const { formatDate } = useFormatting();

    if (isGroupedByStudent) {
        return [
            {
                title: t("registrations.student"),
                key: "student",
                render: (_, record) => (
                    <Text strong>
                        {record.first_name} {record.last_name}
                    </Text>
                ),
                sorter: true,
                dataIndex: "first_name",
            },
            {
                title: t("payment_method", { defaultValue: "Método de Pago" }),
                dataIndex: "payment_method",
                key: "payment_method",
                render: (method) => method ? (
                    <Tag color="cyan">
                        {t(`payments.methods.${method}`, { defaultValue: method.replace('_', ' ').toUpperCase() })}
                    </Tag>
                ) : '-'
            },
            {
                title: t("registrations.classes", { defaultValue: "Clases Inscritas" }),
                key: "classes",
                render: (_, record) => (
                    <Space size={[0, 8]} wrap>
                        {record.classes?.map(cls => (
                            <Tag key={cls.registration_id} color="blue">
                                {cls.name} ({t(`days.${cls.date}`, { defaultValue: cls.date })} - {cls.hour})
                            </Tag>
                        ))}
                    </Space>
                )
            }
            // 
        ];
    }

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
        },
        {
            title: t("payment_method", { defaultValue: "Método de Pago" }),
            dataIndex: "payment_method",
            key: "payment_method",
            render: (method) => method ? (
                <Tag color="cyan">
                    {t(`payments.methods.${method}`, { defaultValue: method.replace('_', ' ').toUpperCase() })}
                </Tag>
            ) : '-'
        }
    ];
};
