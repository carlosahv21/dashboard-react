import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";

const Roles = () => {
    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name" },
        { title: "Descripción", dataIndex: "description", key: "description" },
    ];

    return (
        <BaseCrudView
            endpoint="roles"
            moduleFieldId={4}
            columns={columns}
            titleSingular="Rol"
            titlePlural="Roles"
        />
    );
};

export default Roles;
