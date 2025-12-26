import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";

const Users = () => {
    const columns = [
        {
            title: "Estudiante",
            dataIndex: "user_id",
            key: "user_id"
        },
        { title: "Fecha de pago", dataIndex: "payment_date", key: "payment_date" },
        { title: "Monto", dataIndex: "amount", key: "amount" },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
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
