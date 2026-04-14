import React from "react";
import { Row, Col, Card, Spin, Empty, Divider } from "antd";
import ReactECharts from "echarts-for-react";

const RevenueAnalysisSection = ({
  loading,
  donutOption,
  barComparisonOption,
  theme,
  t,
  onClick
}) => {
  return (
    <>
      <Divider orientation="left">{t("divider.revenueOptimization")}</Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card 
            hoverable 
            title={t("stats.paymentMethodAnalysis")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            <div style={{ height: "400px", width: "100%" }}>
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
              ) : donutOption ? (
                <ReactECharts
                  option={donutOption}
                  theme={theme}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <Empty description={t("global.noData")} />
              )}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            hoverable 
            title={t("stats.transactionsVsAverage")}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          >
            <div style={{ height: "400px", width: "100%" }}>
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
              ) : barComparisonOption ? (
                <ReactECharts
                  option={barComparisonOption}
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

export default RevenueAnalysisSection;
