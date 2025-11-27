import React from "react";
import BaseCrudView from "../../components/Common/BaseView";

const Plans = () => {
    const columns = [
        {
            title: "Nombre",
            dataIndex: "name",
            key: "name",
        },
        { 
            title: "Descripción", 
            dataIndex: "description", 
            key: "description" 
        }
    ];

    return (
        <BaseCrudView
            endpoint="plans"
            moduleFieldId={11}
            columns={columns}
            titleSingular="Plan"
            titlePlural="Planes"
        />

    );
}

export default Plans;
