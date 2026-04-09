import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

export const useHistoryColumns = () => {
    const { t } = useTranslation();
    const { formatDateShort, formatCurrency } = useFormatting();

    const attendanceColumns = [
        { title: t('common.date'), dataIndex: 'date', render: d => formatDateShort(d) },
        { title: t('classes.name'), dataIndex: 'class_name' },
        {
            title: t('common.status'),
            dataIndex: 'status',
            render: s => <Tag color={s === "present" ? "green" : "red"}>{t(`common.${s}`)}</Tag>
        },
    ];

    const paymentColumns = [
        { title: t('common.date'), dataIndex: 'payment_date', render: d => formatDateShort(d) },
        { title: t('payments.amount'), dataIndex: 'amount', render: a => formatCurrency(a) },
        { title: t('payments.method'), dataIndex: 'payment_method' },
    ];

    return { attendanceColumns, paymentColumns };
};