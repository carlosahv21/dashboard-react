import React from "react";
import { useTranslation } from "react-i18next";
import BaseView from "../../../components/Common/BaseView";
import { useAchievementColumns } from "../hooks/useAchievementColumns";

const AchievementsPage = () => {
    const { t } = useTranslation();
    const columns = useAchievementColumns();

    return (
        <BaseView
            endpoint="achievements"
            moduleFieldId="achievements"
            columns={columns}
            titleSingular={t("achievements.name_singular")}
            titlePlural={t("achievements.name_plural")}
            detailPath="/settings/achievements/:id"
        />
    );
};

export default AchievementsPage;
