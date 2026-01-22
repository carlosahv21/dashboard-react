import React from "react";
import BaseCrudView from "../../components/Common/BaseView";
import { useTranslation } from "react-i18next";

const Plans = () => {
    const { t } = useTranslation();
    
    const columns = [
        {
            title: "Nombre",
            dataIndex: "name",
            key: "name",
            sorter: true,
            defaultSortOrder: "ascend"
        },
        { 
            title: "Descripción", 
            dataIndex: "description", 
            key: "description",
            sorter: true, 
        }
    ];

    return (
        <BaseCrudView
            endpoint="plans"
            moduleFieldId={11}
            columns={columns}
            titleSingular={t("plans.name_singular")}
            titlePlural={t("plans.name_plural")}
        />

    );
}

export default Plans;
