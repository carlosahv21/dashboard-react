import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

export const useHistoryColumns = () => {
    const { t } = useTranslation();
    const { formatDateShort, formatCurrency } = useFormatting();

    const attendanceColumns = [
        { title: t('global.date'), dataIndex: 'date', render: d => formatDateShort(d) },
        { title: t('classes.name'), dataIndex: 'class_name' },
        {
            title: t('global.status'),
            dataIndex: 'status',
            render: s => <Tag color={s === "present" ? "green" : "red"}>{t(`global.${s}`)}</Tag>
        },
    ];

    const paymentColumns = [
        { title: t('global.date'), dataIndex: 'payment_date', render: d => formatDateShort(d) },
        { title: t('global.amount'), dataIndex: 'amount', render: a => formatCurrency(a) },
        { title: t('global.method'), dataIndex: 'payment_method' },
    ];

    return { attendanceColumns, paymentColumns };
};