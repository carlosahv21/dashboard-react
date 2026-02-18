import React from "react";
import { Tag } from "antd";
import BaseCrudView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

const Payments = () => {
    const { t } = useTranslation();
    const { formatDate, formatCurrency } = useFormatting();
    const columns = [
        {
            title: t('students.name_singular'),
            dataIndex: "user_first_name",
            key: "user_first_name",
            render: (text, record) => `${record.user_first_name} ${record.user_last_name}`
        },
        {
            title: t('students.date'),
            dataIndex: "payment_date",
            key: "payment_date",
            sorter: true,
            defaultSortOrder: "ascend",
            render: (text, record) => formatDate(record.payment_date)
        },
        {
            title: t('students.amount'),
            dataIndex: "amount",
            key: "amount",
            sorter: true,
            render: (text, record) => formatCurrency(record.amount)
        },
        {
            title: t('students.status'),
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
                return (
                    <Tag color={text === "completed" ? "green" : "red"}>{text}</Tag>
                );
            }
        },
    ];

    return (
        <>
            <BaseCrudView
                breadcrumb={false}
                endpoint="payments"
                moduleFieldId={13}
                columns={columns}
                titleSingular={t('settings.payment')}
                titlePlural={t('settings.payments_title')}
            />
        </>
    );
};

export default Payments;
