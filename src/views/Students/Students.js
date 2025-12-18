import React from "react";
import BaseView from "../../components/Common/BaseView";
import StudentCard from "./StudentCard";

const Students = () => {
    const endpoint = "students";
    const titleSingular = "Estudiante";
    const titlePlural = "Estudiantes";
    const moduleFieldId = 14;
    const hiddenFields = ["role_id"];

    const columns = [
        { title: "Nombre", dataIndex: "first_name", key: "first_name", sorter: true, defaultSortOrder: "ascend" },
        { title: "Apellido", dataIndex: "last_name", key: "last_name", sorter: true },
        { title: "Email", dataIndex: "email", key: "email", sorter: true },
        { title: "Rol", dataIndex: "role_name", key: "role_name", render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "" },
    ];

    return (
        <BaseView
            endpoint={endpoint}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            moduleFieldId={moduleFieldId}
            columns={columns}
            hiddenFields={hiddenFields}
            fixedValues={{ role_id: "2" }}
            filters={{ role_id: "2" }}
            viewOptions={["card", "table"]}
            cardComponent={StudentCard}
        />
    );
};

export default Students;