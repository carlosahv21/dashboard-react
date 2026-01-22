import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";


const Roles = () => {
    const { t } = useTranslation();
    const columns = [
        { title: t('settings.roleName'), dataIndex: "name", key: "name", sorter: true, defaultSortOrder: "ascend" },
        { title: t('settings.roleDescription'), dataIndex: "description", key: "description", sorter: true },
    ];

    return (
        <>
            <BaseCrudView
                breadcrumb={false}
                endpoint="roles"
                moduleFieldId={4}
                columns={columns}
                titleSingular={t('settings.role')}
                titlePlural={t('settings.roles_title')}
            />
        </>
    );
};

export default Roles;
