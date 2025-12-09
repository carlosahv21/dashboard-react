import React from "react";
import BaseCrudView from "../../components/Common/BaseView";

const Classes = () => {
    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name", sorter: true, defaultSortOrder: "ascend" },
        { title: "Nivel", dataIndex: "level", key: "level", sorter: true },
        { title: "Género", dataIndex: "genre", key: "genre", sorter: true },
        { title: "Días de clase", dataIndex: "date", key: "date", sorter: true },
        { title: "Horas de clase", dataIndex: "hour", key: "hour", sorter: true },
    ];

    return (
        <BaseCrudView
            endpoint="classes"
            moduleFieldId={6}
            columns={columns}
            titleSingular="Clase"
            titlePlural="Clases"
        />
    );
};

export default Classes;
