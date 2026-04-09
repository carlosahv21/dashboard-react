import React from "react";
import { Card, Statistic, Typography, Empty } from "antd";
import { DollarOutlined, CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const StatusSummaryCard = ({ data, role, isDarkMode, formatCurrency, settings }) => {
  if (role === "student") {
    return (
      <Card
        title={
          <span>
            <DollarOutlined style={{ marginRight: 8, color: "#52c41a" }} />{" "}
            Estado de Cuenta y Plan
          </span>
        }
        style={{
          marginBottom: 20,
          borderRadius: "16px",
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(0,0,0,0.04)",
          border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
        }}
      >
        {data ? (
          <div style={{ textAlign: "center" }}>
            <Statistic
              title="Clases Restantes"
              value={data.classes_remaining || 0}
              suffix={data.max_classes ? `/ ${data.max_classes}` : ""}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
              Tu plan vence el: {dayjs(data.end_date).format("DD MMM YYYY")}
            </Text>
          </div>
        ) : (
          <Empty
            description="No tienes un plan activo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    );
  }

  if (role === "teacher") {
    return (
      <Card
        title={
          <span>
            <CheckCircleFilled style={{ marginRight: 8, color: "#1890ff" }} />{" "}
            Ratio de Asistencia
          </span>
        }
        style={{
          marginBottom: 20,
          borderRadius: "16px",
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(0,0,0,0.04)",
          border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Statistic
            title="Porcentaje de Asistencia a tus Clases"
            value={data?.ratio || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
          />
        </div>
      </Card>
    );
  }

  if (role === "admin") {
    return (
      <Card
        title={
          <span>
            <DollarOutlined style={{ marginRight: 8, color: "#52c41a" }} />{" "}
            Recaudación del Día
          </span>
        }
        style={{
          marginBottom: 20,
          borderRadius: "16px",
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(0,0,0,0.04)",
          border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Statistic
            title="Total Hoy"
            value={formatCurrency(data?.revenue || 0, settings)}
            valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
          />
        </div>
      </Card>
    );
  }

  return null;
};

export default StatusSummaryCard;
