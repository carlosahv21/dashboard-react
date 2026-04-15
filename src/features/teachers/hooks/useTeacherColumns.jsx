import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const useTeacherColumns = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = [
    {
      title: t("global.name") || "Nombre",
      dataIndex: "first_name",
      key: "full_name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: true,
      defaultSortOrder: "ascend",
    },
    {
      title: t("global.email") || "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: t("global.role") || "Rol",
      dataIndex: "role_name",
      key: "role_name",
      render: (text) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1) : "",
    },
  ];

  return columns;
};
