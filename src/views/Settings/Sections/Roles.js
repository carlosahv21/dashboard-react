import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";
import FormHeader from "../../../components/Common/FormHeader";

const Roles = () => {
    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name" },
        { title: "Descripción", dataIndex: "description", key: "description" },
    ];

    return (
        <>
            <FormHeader
                title="Roles"
                subtitle="Gestiona los roles del sistema"
            />
            <BaseCrudView
                breadcrumb={false}
                endpoint="roles"
                moduleFieldId={4}
                columns={columns}
                titleSingular="Rol"
                titlePlural="Roles"
            />
        </>
    );
};

export default Roles;
