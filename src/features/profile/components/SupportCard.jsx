import React from "react";
import { Card, Button } from "antd";

const SupportCard = ({ settings, t }) => {
  const isDarkMode = settings?.theme === "dark";

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: isDarkMode
          ? "0 4px 12px rgba(0,0,0,0.2)"
          : "0 4px 20px rgba(0,0,0,0.05)",
        background: isDarkMode
          ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
          : "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
        border: `1px solid ${isDarkMode ? "#333" : "#bae7ff"}`,
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            width: 50,
            height: 48,
            borderRadius: "50%",
            background: isDarkMode ? "#007bff40" : "#007bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          ?
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: 16,
              color: isDarkMode ? "#fff" : "inherit",
            }}
          >
            ¿Necesitas ayuda?
          </h4>
          <p
            style={{
              margin: "8px 0 16px",
              color: isDarkMode ? "#aaa" : "#666",
              fontSize: 14,
            }}
          >
            Si tienes problemas con tu cuenta, contacta a soporte técnico.
          </p>
          <Button
            type="link"
            style={{ padding: 0, color: "#007bff", fontWeight: "600" }}
          >
            Contactar Soporte →
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SupportCard;
