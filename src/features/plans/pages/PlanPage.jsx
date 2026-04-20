import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";
import { usePlanColumns } from "../hooks/usePlanColumns";

import PlanDrawerFooter from "../components/PlanDrawerFooter";

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
      footer={(drawerData, navigate) => (
        <PlanDrawerFooter drawerData={drawerData} navigate={navigate} />
      )}
      detailPath="/plans/:id/details"
    />
  );
};

export default PlanPage;
