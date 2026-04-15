import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

const StudentDrawerFooter = ({ drawerData, navigate }) => {
  const { t } = useTranslation();

  if (!drawerData) return null;

  const handleViewProfile = () => {
    // Normalization logic for student ID
    const id = drawerData.id || (drawerData.data && drawerData.data.id);
    navigate(`/students/${id}/profile`);
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

export default StudentDrawerFooter;
