import React from "react";
import BaseCrudView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";


const Users = () => {
    const { t } = useTranslation();
    const columns = [
        {
            title: t('students.firstName'),
            dataIndex: "first_name",
            key: "full_name",
            render: (_, record) => `${record.first_name} ${record.last_name}`,
            sorter: true,
            defaultSortOrder: "ascend"
        },
        { title: t('students.email'), dataIndex: "email", key: "email", sorter: true },
        {
            title: t('students.role'),
            dataIndex: "role_name",
            key: "role_name",
            render: (text) =>
                text ? text.charAt(0).toUpperCase() + text.slice(1) : "",
        },
    ];

    return (
        <>
            <BaseCrudView
                breadcrumb={false}
                endpoint="users"
                moduleFieldId={3}
                columns={columns}
                titleSingular={t('settings.user')}
                titlePlural={t('settings.users_title')}
            />
        </>
    );
};

export default Users;
