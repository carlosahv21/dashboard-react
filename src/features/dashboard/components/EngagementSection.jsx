import React from "react";
import {
  Row,
  Col,
  Card,
  Spin,
  Empty,
  Divider,
  List,
  Avatar,
  Typography,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { formatDate } from "../../../utils/formatters";

const EngagementSection = ({
  loading,
  scatterOption,
  usersAtRisk,
  theme,
  token,
  settings,
  t,
}) => {
  return (
    <>
      <Divider orientation="left">{t("divider.studentEngagement")}</Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card hoverable title={t("stats.utilizationByClass")}>
            <div style={{ height: "450px", width: "100%" }}>
              {loading ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spin size="large" />
                </div>
              ) : scatterOption ? (
                <ReactECharts
                  option={scatterOption}
                  theme={theme}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <Empty description={t("global.noData")} />
              )}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            title={t("stats.usersAtRisk")}
            style={{ minHeight: "555px", maxHeight: "555px", overflowY: "auto" }}
          >
            <Spin spinning={loading}>
              <List
                dataSource={usersAtRisk}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: "rgba(10, 132, 255, 0.2)",
                            color: token.colorPrimary,
                          }}
                        />
                      }
                      title={`${user.first_name} ${user.last_name}`}
                      description={
                        <>
                          {user.email} <br />
                          <Typography.Text type="danger">
                            {user.last_attendance === null
                              ? t("stats.noAttendanceData")
                              : t("stats.lastAttendance") +
                              " " +
                              formatDate(user.last_attendance, settings)}
                          </Typography.Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EngagementSection;
