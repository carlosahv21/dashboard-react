import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";
import { usePlanColumns } from "../hooks/usePlanColumns";

const PlanPage = () => {
  const { t } = useTranslation();
  const columns = usePlanColumns();

  return (
    <BaseView
      endpoint="plans"
      moduleFieldId="plans"
      columns={columns}
      titleSingular={t("plans.name_singular")}
      titlePlural={t("plans.name_plural")}
    />
  );
};

export default PlanPage;
