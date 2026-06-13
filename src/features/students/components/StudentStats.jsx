import React, { useState, useEffect } from "react";
import { Row, Col, Statistic, Spin, Typography, Tag, theme } from "antd";
import {
    TrophyOutlined,
    FireOutlined,
    BookOutlined,
    ClockCircleOutlined,
    StarOutlined,
    ThunderboltOutlined,
    RiseOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFetch from "../../../hooks/useFetch";

const { Text } = Typography;

const StudentStats = ({ studentId }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { request } = useFetch();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await request(`student-stats/student/${studentId}`, "GET");
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching student stats:", err);
            } finally {
                setLoading(false);
            }
        };
        if (studentId) fetchStats();
    }, [studentId, request]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return <Text type="secondary">{t("global.noData")}</Text>;
    }

    return (
        <div style={{ padding: "20px 0" }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ textAlign: "center", padding: 20, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.level")}
                            value={stats.level}
                            prefix={<TrophyOutlined style={{ color: token.colorPrimary }} />}
                            valueStyle={{ fontSize: 36, fontWeight: "bold", color: token.colorPrimary }}
                        />
                        <Tag color="blue" style={{ marginTop: 8, borderRadius: 12 }}>
                            {stats.points} {t("studentStats.points")}
                        </Tag>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ textAlign: "center", padding: 20, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.currentStreak")}
                            value={stats.current_streak}
                            prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
                            suffix={
                                <Text type="secondary" style={{ fontSize: 14 }}>
                                    {t("studentStats.days")}
                                </Text>
                            }
                            valueStyle={{ fontSize: 36, fontWeight: "bold", color: "#ff4d4f" }}
                        />
                        <Tag color="orange" style={{ marginTop: 8, borderRadius: 12 }}>
                            {t("studentStats.longestStreak")}: {stats.longest_streak} {t("studentStats.days")}
                        </Tag>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ textAlign: "center", padding: 20, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.totalClassesAttended")}
                            value={stats.total_classes_attended}
                            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ fontSize: 36, fontWeight: "bold", color: "#52c41a" }}
                        />
                        <Tag color="green" style={{ marginTop: 8, borderRadius: 12 }}>
                            {stats.total_lessons_completed} {t("studentStats.lessonsCompleted")}
                        </Tag>
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={12} sm={8} md={6}>
                    <div style={{ textAlign: "center", padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.readingMinutes")}
                            value={stats.total_reading_minutes}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ fontSize: 24 }}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                    <div style={{ textAlign: "center", padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.reviewsMade")}
                            value={stats.total_reviews_made}
                            prefix={<StarOutlined />}
                            valueStyle={{ fontSize: 24 }}
                        />
                        {stats.average_rating_given > 0 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {t("studentStats.avgRating")}: {stats.average_rating_given?.toFixed(1)}
                            </Text>
                        )}
                    </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                    <div style={{ textAlign: "center", padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.challengesJoined")}
                            value={stats.challenges_joined}
                            prefix={<ThunderboltOutlined />}
                            valueStyle={{ fontSize: 24 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {stats.challenges_completed} {t("studentStats.completed")}
                        </Text>
                    </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                    <div style={{ textAlign: "center", padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 12 }}>
                        <Statistic
                            title={t("studentStats.achievementsCount")}
                            value={stats.achievements_count}
                            prefix={<RiseOutlined />}
                            valueStyle={{ fontSize: 24 }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default StudentStats;
