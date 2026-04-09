import React from "react";
import { Card, Tag, Row, Col } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import useFormatting from "../../../hooks/useFormatting";

const ProfilePlanCard = ({ plan, t, settings }) => {
  const { formatDate } = useFormatting();

  return (
    <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SafetyCertificateOutlined style={{ color: "#007bff", fontSize: 18 }} />
        <span style={{ fontWeight: "bold", fontSize: 16 }}>Plan Actual</span>
      </div>
      <Card
        style={{ backgroundColor: "#f0f7ff", borderRadius: 12, border: "1px solid #e6f7ff" }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>{plan.name}</h3>
              <Tag color="success" style={{ borderRadius: 12, border: "none" }}>{plan.status}</Tag>
            </div>
            <p style={{ color: "#666", marginBottom: 20 }}>Acceso a clases grupales presenciales y material de apoyo.</p>

            <Row gutter={32}>
              <Col>
                <div style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase" }}>Vigencia</div>
                <div style={{ fontWeight: "500" }}>{formatDate(plan.start_date)} - {formatDate(plan.end_date)}</div>
              </Col>
              <Col>
                <div style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase" }}>Progreso Clases</div>
                <div style={{ fontWeight: "500" }}>{plan.classes_used} de {plan.classes_total} Usadas</div>
              </Col>
            </Row>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#007bff" }}>${plan.price}</div>
            <div style={{ color: "#8c8c8c", fontSize: 12 }}>Facturado mensual</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ height: 8, background: "#e6f7ff", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(plan.classes_used / plan.classes_total) * 100}%`, height: "100%", background: "#007bff" }} />
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default ProfilePlanCard;
