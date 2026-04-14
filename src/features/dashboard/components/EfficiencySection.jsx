import React from "react";
import { Row, Col, Card, Spin, Empty, Divider } from "antd";
import ReactECharts from "echarts-for-react";

const EfficiencySection = ({
  loading,
  fillRateOption,
  teacherRadarOption,
  theme,
  t,
  onClick
}) => {
  return (
    <>
      <Divider orientation="left">{t("divider.operationalEfficiency")}</Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={14}>
          <Card 
            hoverable 
            title={t("stats.occupancyClass")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            <div style={{ height: "500px", width: "100%" }}>
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
              ) : fillRateOption ? (
                <ReactECharts
                  option={fillRateOption}
                  theme={theme}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <Empty description={t("global.noData")} />
              )}
            </div>
          </Card>
        </Col>
        <Col span={10}>
          <Card 
            hoverable 
            title={t("stats.teachersEfficiency")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            <div style={{ height: "500px", width: "100%" }}>
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
              ) : teacherRadarOption ? (
                <ReactECharts
                  option={teacherRadarOption}
                  theme={theme}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <Empty description={t("global.noData")} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EfficiencySection;
