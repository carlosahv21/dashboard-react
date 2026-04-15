import React from "react";
import BaseView from "../../../components/Common/BaseView";
import { useTranslation } from "react-i18next";
import { useTeacherColumns } from "../hooks/useTeacherColumns";
import TeacherDrawerFooter from "../components/TeacherDrawerFooter";

const TeacherPage = () => {
  const { t } = useTranslation();
  const columns = useTeacherColumns();

  return (
    <BaseView
      endpoint="teachers"
      moduleFieldId="teachers"
      columns={columns}
      hiddenFields={["role"]}
      titleSingular={t("teachers.name_singular")}
      titlePlural={t("teachers.name_plural")}
      fixedValues={{ role: "teacher" }}
      filters={{ role: "teacher" }}
      footer={(drawerData, navigate) => (
        <TeacherDrawerFooter drawerData={drawerData} navigate={navigate} />
      )}
    />
  );
};

export default TeacherPage;
