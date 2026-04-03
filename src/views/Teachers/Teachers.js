import React from "react";
import BaseCrudView from "../../components/Common/BaseView";
import { useTranslation } from "react-i18next";

const Teachers = () => {
    const { t } = useTranslation();
    const endpoint = "teachers";
    const titleSingular = t('teachers.name_singular');
    const titlePlural = t('teachers.name_plural');
    const moduleFieldId = "teachers";
    const hiddenFields = ["role"];

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
            endpoint={endpoint}
            moduleFieldId={moduleFieldId}
            columns={columns}
            hiddenFields={hiddenFields}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            fixedValues={{ role: "teacher" }}
            filters={{ role: "teacher" }}
        />

    );
};

export default Teachers;