import React from "react";
import { Card, Empty, List, Avatar, Typography, Statistic } from "antd";
import { LineChartOutlined, TrophyOutlined, UserAddOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

const { Text } = Typography;

const ActivityInsightCard = ({ data, role, isDarkMode }) => {
  if (role === "student" && data) {
    return (
      <Card
        title={
          <span>
            <LineChartOutlined style={{ marginRight: 8, color: "#eb2f96" }} />{" "}
            Asistencia Semanal
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
        {data.present === 0 && data.absent === 0 ? (
          <Empty
            description="No hay clases esta semana"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <ReactECharts
            option={{
              tooltip: { trigger: "item" },
              legend: {
                bottom: 0,
                textStyle: { color: isDarkMode ? "#fff" : "#333" },
              },
              series: [
                {
                  name: "Asistencia",
                  type: "pie",
                  radius: ["40%", "70%"],
                  data: [
                    {
                      value: data.present,
                      name: "Asistidas",
                      itemStyle: { color: "#52c41a" },
                    },
                    {
                      value: data.absent,
                      name: "Ausencias",
                      itemStyle: { color: "#f5222d" },
                    },
                  ],
                },
              ],
            }}
            style={{ height: "250px" }}
          />
        )}
      </Card>
    );
  }

  if (role === "teacher" && data?.topClasses) {
    return (
      <Card
        title={
          <span>
            <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} /> Mayor
            Inscripción
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
        <List
          dataSource={data.topClasses}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: index === 0 ? "#faad14" : "#1890ff",
                      color: "#fff",
                    }}
                  >
                    {index + 1}
                  </Avatar>
                }
                title={
                  <Text strong style={{ color: isDarkMode ? "#fff" : "#262626" }}>
                    {item.name}
                  </Text>
                }
                description={
                  <span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>
                    {item.studentCount} activos
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  }

  if (role === "admin") {
    return (
      <Card
        title={
          <span>
            <UserAddOutlined style={{ marginRight: 8, color: "#13c2c2" }} />{" "}
            Nuevos Estudiantes
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
            title={
              <span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>
                Registrados esta semana
              </span>
            }
            value={data?.newStudentsCount || 0}
            valueStyle={{
              color: "#13c2c2",
              fontWeight: "bold",
              fontSize: "32px",
            }}
          />
        </div>
      </Card>
    );
  }

  return null;
};

export default ActivityInsightCard;
