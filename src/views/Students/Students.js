import React from "react";
import BaseCrudView from "../../components/Common/BaseView";

const Students = () => {
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
        <BaseCrudView
            endpoint="students"
            moduleFieldId={14}
            columns={columns}
            titleSingular="Estudiante"
            titlePlural="Estudiantes"
            filters={{ role_id: "2" }}
            fixedValues={{ role_id: "2" }}
            hiddenFields={["role_id"]}
        />


    );
};

export default Students;