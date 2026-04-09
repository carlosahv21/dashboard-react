import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";
import { useClassColumns } from "../hooks/useClassColumns";

const ClassPage = () => {
  const { t } = useTranslation();
  const columns = useClassColumns();

  return (
    <BaseView
      endpoint="classes"
      moduleFieldId="classes"
      columns={columns}
      titleSingular={t("classes.name_singular")}
      titlePlural={t("classes.name_plural")}
    />
  );
};

export default ClassPage;
