import React from "react";
import { useTranslation } from "react-i18next";
import BaseView from "../../../components/Common/BaseView";
import { useChallengeColumns } from "../hooks/useChallengeColumns";

const ChallengesPage = () => {
    const { t } = useTranslation();
    const columns = useChallengeColumns();

    return (
        <BaseView
            endpoint="challenges"
            moduleFieldId="challenges"
            columns={columns}
            titleSingular={t("challenges.name_singular")}
            titlePlural={t("challenges.name_plural")}
            detailPath="/settings/challenges/:id"
        />
    );
};

export default ChallengesPage;
