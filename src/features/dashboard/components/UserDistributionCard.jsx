import React from "react";
import { Card, Spin, Empty } from "antd";
import ReactECharts from "echarts-for-react";

const UserDistributionCard = ({ loading, option, theme, t, onClick }) => {
  return (
    <Card 
      hoverable 
      title={t("stats.userDistributionByPlan")}
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
        ) : option ? (
          <ReactECharts
            option={option}
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
            <Empty description={t("global.noData")} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserDistributionCard;
