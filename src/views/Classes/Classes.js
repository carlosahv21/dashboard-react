import React from "react";
import BaseCrudView from "../../components/Common/BaseView";

const Classes = () => {
    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name", sorter: true },
        { title: "Nivel", dataIndex: "level", key: "level" },
        { title: "Género", dataIndex: "genre", key: "genre" },
        { title: "Días de clase", dataIndex: "date", key: "date" },
        { title: "Horas de clase", dataIndex: "hour", key: "hour" },
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
