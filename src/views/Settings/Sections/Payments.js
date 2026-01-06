import React from "react";
import { Tag } from "antd";
import BaseCrudView from "../../../components/Common/BaseView";
import dayjs from "dayjs";

const Users = () => {
    const columns = [
        {
            title: "Estudiante",
            dataIndex: "user_first_name",
            key: "user_first_name",
            render: (text, record) => `${record.user_first_name} ${record.user_last_name}`
        },
        {
            title: "Fecha de pago",
            dataIndex: "payment_date",
            key: "payment_date",
            sorter: true,
            defaultSortOrder: "ascend",
            render: (text, record) => dayjs(record.payment_date).format("DD/MM/YYYY")
        },
        {
            title: "Monto",
            dataIndex: "amount",
            key: "amount",
            sorter: true,
            render: (text, record) => `$`+record.amount
        },
        {
            title: "Estado",
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
                titleSingular="Pago"
                titlePlural="Pagos"
            />
        </>
    );
};

export default Users;
