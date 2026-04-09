import React from "react";
import { Card, Spin, Select } from "antd";
import ReactECharts from "echarts-for-react";

const OccupancyChart = ({
  loading,
  option,
  onChartReady,
  availableGenres,
  selectedGenre,
  onGenreChange,
  t,
  theme,
}) => {
  return (
    <Card
      hoverable
      title={t("stats.occupancyByClass")}
      extra={
        <Select
          value={selectedGenre}
          onChange={onGenreChange}
          style={{ width: 200 }}
          placeholder={t("stats.selectGenre")}
          options={availableGenres.map((genre) => ({
            label: genre,
            value: genre,
          }))}
        />
      }
      style={{ marginBottom: 24 }}
    >
      <Spin spinning={loading}>
        <div style={{ height: "400px", width: "100%" }}>
          {option ? (
            <ReactECharts
              option={option}
              onChartReady={onChartReady}
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
      </Spin>
    </Card>
  );
};

export default OccupancyChart;
