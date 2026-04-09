import { useTranslation } from "react-i18next";

export const usePlanColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("global.name") || "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
      defaultSortOrder: "ascend",
    },
    {
      title: t("global.description") || "Descripción",
      dataIndex: "description",
      key: "description",
      sorter: true,
    },
  ];

  return columns;
};
