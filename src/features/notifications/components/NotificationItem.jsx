import React from "react";
import { List, Card, Avatar, Typography, Badge, Space, Tooltip, Button } from "antd";
import {
  CheckCircleFilled,
  WalletFilled,
  InfoCircleFilled,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const NotificationItem = ({
  item,
  isDarkMode,
  t,
  markAsRead,
  deleteNotification,
  navigate,
  formatRelativeTime,
}) => {
  const getNotificationType = (notif) => {
    const title = (notif.title || "").toLowerCase();
    if (
      title.includes("calificaci") ||
      title.includes("nota") ||
      title.includes("éxito") ||
      title.includes("completado")
    ) {
      return { icon: <CheckCircleFilled />, color: "#52c41a", bg: "#f6ffed" };
    }
    if (
      title.includes("pago") ||
      title.includes("cuota") ||
      title.includes("alerta") ||
      title.includes("vencimiento")
    ) {
      return { icon: <WalletFilled />, color: "#faad14", bg: "#fff7e6" };
    }
    return { icon: <InfoCircleFilled />, color: "#1890ff", bg: "#e6f7ff" };
  };

  const { icon, color, bg } = getNotificationType(item);

  return (
    <List.Item style={{ padding: 0, marginBottom: 20 }}>
      <Card
        bordered={true}
        style={{
          width: "100%",
          borderRadius: "16px",
          boxShadow: isDarkMode
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(0,0,0,0.04)",
          border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
          backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
          cursor: item.deep_link ? "pointer" : "default",
        }}
        bodyStyle={{ padding: "20px 24px" }}
        onClick={() => {
          if (!item.is_read) markAsRead(item.id);
          if (item.deep_link) navigate(item.deep_link);
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Avatar
            size={52}
            icon={icon}
            style={{
              backgroundColor: isDarkMode ? "#2d2d2d" : bg,
              color: color,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              border: isDarkMode ? `1px solid ${color}40` : "none",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "16px",
                  color: isDarkMode ? "#fff" : "#262626",
                }}
              >
                {item.title}
              </Text>
              {!item.is_read && <Badge status="processing" color="#1890ff" />}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: isDarkMode ? "#aaa" : "#595959",
                marginBottom: 6,
                lineHeight: "1.5",
              }}
            >
              {item.body || item.message}
            </div>
            <Text
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                fontWeight: 400,
              }}
            >
              {formatRelativeTime(item.created_at)}
            </Text>
          </div>

          <Space size={16} align="center">
            {!item.is_read && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Tooltip title={t("notifications.markAsRead")}>
                  <Button
                    shape="circle"
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item.id);
                    }}
                    style={{
                      backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f2f5",
                      border: "none",
                      color: "#52c41a",
                    }}
                  />
                </Tooltip>
                <Text
                  style={{
                    fontSize: "10px",
                    color: "#8c8c8c",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {t("notifications.readShort")}
                </Text>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Tooltip title={t("global.delete")}>
                <Button
                  shape="circle"
                  size="large"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  style={{
                    border: "none",
                  }}
                />
              </Tooltip>
            </div>
          </Space>
        </div>
      </Card>
    </List.Item>
  );
};

export default NotificationItem;
