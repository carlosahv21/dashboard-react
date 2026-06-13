import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Spin, Empty, Tag, theme } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFetch from "../../../hooks/useFetch";

const { Text, Title } = Typography;

const StudentAchievements = ({ studentId }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { request } = useFetch();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                setLoading(true);
                const response = await request(`user-achievements/user/${studentId}`, "GET");
                setAchievements(response.data || []);
            } catch (err) {
                console.error("Error fetching achievements:", err);
            } finally {
                setLoading(false);
            }
        };
        if (studentId) fetchAchievements();
    }, [studentId, request]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!achievements.length) {
        return <Empty description={t("global.noData")} style={{ padding: "60px 0" }} />;
    }

    const categoryColors = {
        attendance: "green",
        performance: "blue",
        social: "purple",
        milestone: "gold",
        special: "magenta",
    };

    return (
        <div style={{ padding: "20px 0" }}>
            <Row gutter={[16, 16]}>
                {achievements.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            bordered={false}
                            style={{
                                textAlign: "center",
                                borderRadius: 12,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                height: "100%",
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            {item.achievement_icon ? (
                                <img
                                    src={item.achievement_icon}
                                    alt={item.achievement_name}
                                    style={{ width: 56, height: 56, marginBottom: 12, objectFit: "contain" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        margin: "0 auto 12px",
                                        borderRadius: "50%",
                                        backgroundColor: token.colorFillAlter,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <TrophyOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                                </div>
                            )}
                            <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                                {item.achievement_name}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                                {item.achievement_description}
                            </Text>
                            <Tag
                                color={categoryColors[item.achievement_category] || "default"}
                                style={{ marginTop: 8, borderRadius: 12, fontSize: 11 }}
                            >
                                {item.achievement_category}
                            </Tag>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default StudentAchievements;
