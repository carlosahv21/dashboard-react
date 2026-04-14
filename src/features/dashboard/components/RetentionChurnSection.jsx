import React from "react";
import { Row, Col, Card, Spin, Empty, Divider } from "antd";
import ReactECharts from "echarts-for-react";

const RetentionChurnSection = ({
  loading,
  heatmapOption,
  churnGaugeOption,
  theme,
  t,
  onClick
}) => {
  return (
    <>
      <Divider orientation="left">{t("divider.retentionChurn")}</Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card 
            hoverable 
            title={t("stats.retentionChurn")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
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
              ) : heatmapOption ? (
                <ReactECharts
                  option={heatmapOption}
                  theme={theme}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p>{t("global.noData")}</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            hoverable 
            title={t("stats.churnRate")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                height: "450px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
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
              ) : (
                <>
                  {churnGaugeOption ? (
                    <ReactECharts
                      option={churnGaugeOption}
                      theme={theme}
                      style={{ height: "300px", width: "100%" }}
                    />
                  ) : (
                    <Empty description={t("stats.noChurnData")} />
                  )}
                  <div style={{ textAlign: "center", marginTop: -40 }}>
                    <p style={{ color: "#999" }}>{t("stats.lastMonthAnalyzed")}</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RetentionChurnSection;
