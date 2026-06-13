import React, { useState, useEffect } from "react";
import { List, Typography, Rate, Tag, Empty, Spin, Space, theme } from "antd";
import { CommentOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFetch from "../../../hooks/useFetch";

const { Text, Paragraph } = Typography;

const TeacherReviews = ({ teacherId }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { request } = useFetch();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await request(`teacher-reviews/teacher/${teacherId}`, "GET");
                setReviews(response.data || []);
            } catch (err) {
                console.error("Error fetching teacher reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        if (teacherId) fetchReviews();
    }, [teacherId, request]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Spin />
            </div>
        );
    }

    if (!reviews.length) {
        return <Empty description={t("global.noData")} style={{ padding: "40px 0" }} />;
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Rate disabled value={Number(averageRating)} allowHalf style={{ fontSize: 20 }} />
                <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {averageRating} {t("teacherReviews.outOf")} 5 · {reviews.length} {t("teacherReviews.reviews")}
                    </Text>
                </div>
            </div>
            <List
                dataSource={reviews.slice(0, 5)}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                item.is_anonymous ? (
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            backgroundColor: token.colorFillAlter,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <UserOutlined style={{ color: token.colorTextSecondary }} />
                                    </div>
                                ) : null
                            }
                            title={
                                <Space>
                                    <Rate disabled value={item.rating} style={{ fontSize: 12 }} />
                                    {item.class_name && <Tag>{item.class_name}</Tag>}
                                </Space>
                            }
                            description={
                                <>
                                    <Paragraph style={{ margin: 0, fontSize: 13 }}>
                                        {item.is_anonymous
                                            ? t("teacherReviews.anonymous")
                                            : `${item.student_first_name} ${item.student_last_name}`}
                                    </Paragraph>
                                    {item.comment && (
                                        <Paragraph style={{ margin: "4px 0 0", fontSize: 12 }}>
                                            {item.comment}
                                        </Paragraph>
                                    )}
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TeacherReviews;
