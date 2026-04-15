import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useRegistrationColumns } from "../hooks/useRegistrationColumns";
import { useTranslation } from "react-i18next";

const RegistrationListPage = () => {
    const { t } = useTranslation();
    const endpoint = "registrations";
    const titleSingular = t('registrations.name_singular');
    const titlePlural = t('registrations.name_plural');
    const moduleFieldId = "registrations";

    const columns = useRegistrationColumns();

    return (
        <BaseView
            endpoint={endpoint}
            titleSingular={titleSingular}
            titlePlural={titlePlural}
            moduleFieldId={moduleFieldId}
            columns={columns}
            viewOptions={["table"]}
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
