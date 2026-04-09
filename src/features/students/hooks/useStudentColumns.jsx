import { useTranslation } from "react-i18next";

export const useStudentColumns = () => {
    const { t } = useTranslation();

    const columns = [
        { 
            title: t('students.firstName'), 
            dataIndex: "first_name", 
            key: "first_name", 
            sorter: true, 
            defaultSortOrder: "ascend" 
        },
        { 
            title: t('students.lastName'), 
            dataIndex: "last_name", 
            key: "last_name", 
            sorter: true 
        },
        { 
            title: t('students.email'), 
            dataIndex: "email", 
            key: "email", 
            sorter: true 
        },
        { 
            title: t('students.role'), 
            dataIndex: "role_name", 
            key: "role_name", 
            render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : t('global.no_role') 
        },
    ];

    return columns;
};