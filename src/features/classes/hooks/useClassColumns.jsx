import { useTranslation } from "react-i18next";

export const useClassColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("classes.name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      defaultSortOrder: "ascend",
    },
    { title: t("classes.level"), dataIndex: "level", key: "level", sorter: true },
    { title: t("classes.genre"), dataIndex: "genre", key: "genre", sorter: true },
    { title: t("classes.date"), dataIndex: "date", key: "date", sorter: true },
    { title: t("classes.hour"), dataIndex: "hour", key: "hour", sorter: true },
  ];

  return columns;
};
