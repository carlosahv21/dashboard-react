import { useTranslation } from "react-i18next";

export const usePlanColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("global.name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      defaultSortOrder: "ascend",
    },
    {
      title: t("global.description"),
      dataIndex: "description",
      key: "description",
      sorter: true,
    },
  ];

  return columns;
};
