import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";


const Roles = () => {
    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name", sorter: true, defaultSortOrder: "ascend" },
        { title: "Descripción", dataIndex: "description", key: "description", sorter: true },
    ];

    return (
        <>
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
