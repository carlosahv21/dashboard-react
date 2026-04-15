import React from "react";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

const { Text } = Typography;

export const useAttendanceColumns = () => {
    const { t } = useTranslation();
    const { formatDate } = useFormatting();

    return [
        {
            title: t("attendances.student", { defaultValue: "Estudiante" }),
            key: "student",
            render: (_, record) => (
                <Text strong>
                    {record.student_first_name} {record.student_last_name}
                </Text>
            ),
            sorter: true,
            dataIndex: "student_first_name",
        },
        {
            title: t("attendances.class", { defaultValue: "Clase" }),
            dataIndex: "class_name",
            key: "class_name",
            sorter: true,
        },
        {
            title: t("attendances.date", { defaultValue: "Fecha" }),
            dataIndex: "date",
            key: "date",
            render: (date) => formatDate(date),
            sorter: true,
            defaultSortOrder: "descend",
        },
        {
            title: t("attendances.status", { defaultValue: "Estado" }),
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const isPresent = status?.toLowerCase() === "present";
                return (
                    <Tag color={isPresent ? "green" : "red"}>
                        {t(isPresent ? "attendances.present" : "attendances.absent", { defaultValue: isPresent ? "Presente" : "Ausente" })}
                    </Tag>
                );
            },
            sorter: true,
        }
    ];
};
