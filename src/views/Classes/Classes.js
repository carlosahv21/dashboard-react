import React from "react";
import BaseCrudView from "../../components/Common/BaseView";
import { useTranslation } from "react-i18next";

const Classes = () => {
    const { t } = useTranslation();
    const columns = [
        { title: t('classes.name'), dataIndex: "name", key: "name", sorter: true, defaultSortOrder: "ascend" },
        { title: t('classes.level'), dataIndex: "level", key: "level", sorter: true },
        { title: t('classes.genre'), dataIndex: "genre", key: "genre", sorter: true },
        { title: t('classes.date'), dataIndex: "date", key: "date", sorter: true },
        { title: t('classes.hour'), dataIndex: "hour", key: "hour", sorter: true },
    ];

    return (
        <BaseCrudView
            endpoint="classes"
            moduleFieldId={6}
            columns={columns}
            titleSingular={t('classes.name_singular')}
            titlePlural={t('classes.name_plural')}
        />
    );
};

export default Classes;
