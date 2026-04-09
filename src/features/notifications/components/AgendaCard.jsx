import React from "react";
import { List, Card, Typography, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AgendaCard = ({ data, loading, isDarkMode, role }) => {
  const title = role === "admin" ? "Clases de Hoy" : "Mi Agenda de Hoy";

  return (
    <Card
      title={
        <span>
          <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />{" "}
          {title}
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
      {data && data.length > 0 ? (
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Text strong style={{ color: isDarkMode ? "#fff" : "#262626" }}>
                    {item.name}
                  </Text>
                }
                description={
                  <span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>
                    {`${item.genre || "Clase"} • Nivel ${
                      item.level || "Básico"
                    } • ${item.hour || ""}`}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No hay clases programadas para hoy"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default AgendaCard;
