import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Typography, Spin, Empty, Tag, Button, Progress, Space, message, theme } from "antd";
import { ThunderboltOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFetch from "../../../hooks/useFetch";

const { Text, Title } = Typography;

const StudentChallenges = ({ studentId }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { request } = useFetch();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = useCallback(async () => {
        try {
            setLoading(true);
            const response = await request(`user-challenges/user/${studentId}`, "GET");
            setChallenges(response.data || []);
        } catch (err) {
            console.error("Error fetching challenges:", err);
        } finally {
            setLoading(false);
        }
    }, [studentId, request]);

    useEffect(() => {
        if (studentId) fetchChallenges();
    }, [studentId, fetchChallenges]);

    const handleLeave = async (challengeId) => {
        try {
            await request(`user-challenges/leave/${challengeId}`, "DELETE");
            message.success(t("studentChallenges.leaveSuccess"));
            fetchChallenges();
        } catch (err) {
            message.error(err.message || t("studentChallenges.leaveError"));
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!challenges.length) {
        return <Empty description={t("global.noData")} style={{ padding: "60px 0" }} />;
    }

    const statusConfig = {
        active: { color: "processing", icon: <ClockCircleOutlined />, label: t("studentChallenges.statusActive") },
        completed: { color: "success", icon: <CheckCircleOutlined />, label: t("studentChallenges.statusCompleted") },
        abandoned: { color: "default", icon: null, label: t("studentChallenges.statusAbandoned") },
    };

    return (
        <div style={{ padding: "20px 0" }}>
            <Row gutter={[16, 16]}>
                {challenges.map((item) => {
                    const status = statusConfig[item.status] || statusConfig.active;
                    const progressPercent = item.goal_value > 0
                        ? Math.min(100, Math.round((item.progress / item.goal_value) * 100))
                        : 0;

                    return (
                        <Col key={item.id} xs={24} sm={12} lg={8}>
                            <Card
                                bordered={false}
                                style={{
                                    borderRadius: 12,
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                    height: "100%",
                                }}
                            >
                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>
                                                <ThunderboltOutlined style={{ color: token.colorPrimary, marginRight: 6 }} />
                                                {item.challenge_name}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {item.challenge_type}
                                            </Text>
                                        </div>
                                        <Tag icon={status.icon} color={status.color}>
                                            {status.label}
                                        </Tag>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                        {item.challenge_description}
                                    </Text>

                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <Text style={{ fontSize: 12 }}>
                                                {item.progress} / {item.goal_value}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {progressPercent}%
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={progressPercent}
                                            showInfo={false}
                                            status={item.status === "completed" ? "success" : "active"}
                                            strokeColor={item.status === "completed" ? "#52c41a" : token.colorPrimary}
                                        />
                                    </div>

                                    {item.status === "active" && (
                                        <Button
                                            danger
                                            size="small"
                                            block
                                            onClick={() => handleLeave(item.challenge_id)}
                                        >
                                            {t("studentChallenges.leave")}
                                        </Button>
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default StudentChallenges;
