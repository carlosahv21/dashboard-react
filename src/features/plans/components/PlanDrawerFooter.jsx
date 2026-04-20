import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

const PlanDrawerFooter = ({ drawerData, navigate }) => {
  const { t } = useTranslation();

  if (!drawerData) return null;

  const handleViewDetails = () => {
    // Normalization logic for plan ID (checking both flat data and header-wrap)
    const id = drawerData.id || (drawerData.header && drawerData.header.id) || (drawerData.data && drawerData.data.id);
    navigate(`/plans/${id}/details`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px" }}>
      <Button
        type="primary"
        onClick={handleViewDetails}
      >
        {t("global.viewDetail") || "Ver Detalle"}
      </Button>
    </div>
  );
};

export default PlanDrawerFooter;
