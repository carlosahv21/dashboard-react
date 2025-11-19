import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";
import FormHeader from "../../../components/Common/FormHeader";

const Users = () => {
    const columns = [
        {
            title: "Nombre",
            key: "full_name",
            render: (_, record) => `${record.first_name} ${record.last_name}`,
        },
        { title: "Email", dataIndex: "email", key: "email" },
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
            <FormHeader
                title="Users"
                subtitle="Gestiona los usuarios del sistema"
            />
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
