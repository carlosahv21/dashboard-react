import React from "react";
import BaseCrudView from "../../components/Common/BaseView";

const Students = () => {
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
        <BaseCrudView
            endpoint="users"
            moduleFieldId={3}
            columns={columns}
            titleSingular="Estudiante"
            titlePlural="Estudiantes"
            filters={{ role: "student" }}
            fixedValues={{ role: "student" }}        // ← rol fijo
            hiddenFields={["role"]}                 // ← ocultar el campo en el formulario
        />


    );
};

export default Students;