import React from "react";
import BaseView from "../../components/Common/BaseView";
import StudentCard from "./StudentCard";
import { useTranslation } from "react-i18next";

const Students = () => {
    const { t } = useTranslation();
    const endpoint = "students";
    const titleSingular = t('students.name_singular');
    const titlePlural = t('students.name_plural');
    const moduleFieldId = 15;
    const hiddenFields = ["role_id"];

    const columns = [
        { title: t('students.firstName'), dataIndex: "first_name", key: "first_name", sorter: true, defaultSortOrder: "ascend" },
        { title: t('students.lastName'), dataIndex: "last_name", key: "last_name", sorter: true },
        { title: t('students.email'), dataIndex: "email", key: "email", sorter: true },
        { title: t('students.role'), dataIndex: "role_name", key: "role_name", render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "" },
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