import React from "react";
import BaseView from "../../../components/Common/BaseView";
import StudentCard from "../components/StudentCard";
import { useStudentColumns } from "../hooks/useStudentColumns";
import { useTranslation } from "react-i18next";

const StudentPage = () => {
    const { t } = useTranslation();
    const endpoint = "students";
    const titleSingular = t('students.name_singular');
    const titlePlural = t('students.name_plural');
    const moduleFieldId = "students";
    const hiddenFields = ["role"];

    const columns = useStudentColumns();

    return (
        <BaseView
            endpoint={endpoint}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            moduleFieldId={moduleFieldId}
            columns={columns}
            hiddenFields={hiddenFields}
            fixedValues={{ role: "student" }}
            filters={{ role: "student" }}
            viewOptions={["card", "table"]}
            cardComponent={StudentCard}
        />
    );
};

export default StudentPage;