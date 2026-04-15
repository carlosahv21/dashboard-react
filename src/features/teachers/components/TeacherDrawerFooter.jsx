import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

const TeacherDrawerFooter = ({ drawerData, navigate }) => {
  const { t } = useTranslation();

  if (!drawerData) return null;

  const handleViewProfile = () => {
    const id = drawerData.id || (drawerData.header && drawerData.header.id);
    navigate(`/teachers/${id}/profile`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px" }}>
      <Button
        type="primary"
        onClick={handleViewProfile}
      >
        {t("global.viewProfile") || "Ver Perfil"}
      </Button>
    </div>
  );
};

export default TeacherDrawerFooter;
