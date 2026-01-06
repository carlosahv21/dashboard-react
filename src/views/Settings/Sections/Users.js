import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";


const Users = () => {
    const columns = [
        {
            title: "Nombre",
            dataIndex: "first_name",
            key: "full_name",
            render: (_, record) => `${record.first_name} ${record.last_name}`,
            sorter: true,
            defaultSortOrder: "ascend"
        },
        { title: "Email", dataIndex: "email", key: "email", sorter: true },
        {
            title: "Rol",
            dataIndex: "role_name",
            key: "role_name",
            render: (text) =>
                text ? text.charAt(0).toUpperCase() + text.slice(1) : "",
        },
    ];

    return (
        <>
            <BaseCrudView
                breadcrumb={false}
                endpoint="users"
                moduleFieldId={3}
                columns={columns}
                titleSingular="Usuario"
                titlePlural="Usuarios"
            />
        </>
    );
};

export default Users;
