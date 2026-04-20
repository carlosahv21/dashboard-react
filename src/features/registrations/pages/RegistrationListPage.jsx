import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useRegistrationColumns } from "../hooks/useRegistrationColumns";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const RegistrationListPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isGroupedByStudent = searchParams.get('group_by') === 'student';

    const endpoint = "registrations";
    const titleSingular = t('registrations.name_singular');
    const titlePlural = t('registrations.name_plural');
    const moduleFieldId = "registrations";

    const columns = useRegistrationColumns(isGroupedByStudent);

    return (
        <BaseView
            endpoint={endpoint}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            moduleFieldId={moduleFieldId}
            columns={columns}
            viewOptions={["table"]}
            rowKey={isGroupedByStudent ? "user_id" : "id"}
            disableActions={isGroupedByStudent}
            extraActions={
                [
                    {
                        label: t("registrations.enroll_classes"),
                        path: "/registrations/enroll",
                        icon: "Plus"
                    }
                ]
            }
        />
    );
};

export default RegistrationListPage;
