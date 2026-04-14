import React from "react";
import { Row, Col, Card, Spin, Statistic } from "antd";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils/formatters";

const KpiStats = ({ kpiLoading, kpiData, t, token, settings, onKpiClick }) => {
  const cardStyle = {
    borderLeft: `4px solid ${token.colorPrimary}`,
    cursor: "pointer",
    transition: "transform 0.2s",
  };

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={6}>
        <Card
          hoverable
          style={cardStyle}
          onClick={() => onKpiClick("activeStudents")}
        >
          <Spin spinning={kpiLoading}>
            <Statistic
              title={t("dashboard.activeStudents")}
              value={kpiData.activeStudents}
              suffix={
                <UserOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
              }
            />
          </Spin>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card
          hoverable
          style={cardStyle}
          onClick={() => onKpiClick("todayClasses")}
        >
          <Spin spinning={kpiLoading}>
            <Statistic
              title={t("dashboard.todayClasses")}
              value={kpiData.todayClasses}
              suffix={
                <BookOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
              }
            />
          </Spin>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card
          hoverable
          style={cardStyle}
          onClick={() => onKpiClick("monthlyRevenue")}
        >
          <Spin spinning={kpiLoading}>
            <Statistic
              title={t("dashboard.monthlyRevenue")}
              value={formatCurrency(kpiData.monthlyRevenue, settings || {})}
              suffix={
                <DollarOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
              }
            />
          </Spin>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card
          hoverable
          style={cardStyle}
          onClick={() => onKpiClick("attendanceRate")}
        >
          <Spin spinning={kpiLoading}>
            <Statistic
              title={t("dashboard.attendanceRate")}
              value={kpiData.attendanceRate}
              precision={1}
              suffix={
                <CheckCircleOutlined
                  style={{ marginLeft: 8, color: token.colorPrimary }}
                />
              }
            />
          </Spin>
        </Card>
      </Col>
    </Row>
  );
};

export default KpiStats;
