import React from "react";
import { Card, Spin, Empty, Typography, Divider } from "antd";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";

const AuditLogCard = ({ loading, isSuspicious, t, onClick }) => {
  return (
    <>
      <Divider orientation="left">{t("divider.adminAuditControl")}</Divider>
      <Card 
        hoverable 
        style={{ textAlign: "center", padding: "40px 0", cursor: "pointer" }}
        onClick={onClick}
      >
        {loading ? (
          <Spin size="large" />
        ) : !isSuspicious ? (
          <Empty
            image={
              <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
            }
            description={
              <Typography.Title level={4} style={{ color: "#52c41a" }}>
                {t("stats.noSuspiciousActivity")}
              </Typography.Title>
            }
          >
            <Typography.Text type="secondary">
              {t("stats.noSuspiciousActivityDescription")}
            </Typography.Text>
          </Empty>
        ) : (
          <Empty
            image={<WarningOutlined style={{ fontSize: 64, color: "#faad14" }} />}
            description={
              <Typography.Title level={4} style={{ color: "#faad14" }}>
                {t("stats.suspiciousActivity")}
              </Typography.Title>
            }
          />
        )}
      </Card>
    </>
  );
};

export default AuditLogCard;
