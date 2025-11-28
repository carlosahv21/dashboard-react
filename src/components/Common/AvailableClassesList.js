import React from "react";
import { List, Card, Tag, Typography, Empty } from "antd";
import { ClockCircleOutlined, CalendarOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AvailableClassesList = ({ classes, onClassSelect, enrolledClassIds = [] }) => {
    if (!classes || classes.length === 0) {
        return <Empty description="No hay clases disponibles" />;
    }

    return (
        <List
            grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 1,
                xxl: 1,
            }}
            dataSource={classes}
            renderItem={(classItem) => {
                const isEnrolled = enrolledClassIds.includes(classItem.id);

                return (
                    <List.Item>
                        <Card
                            hoverable={!isEnrolled}
                            onClick={() => !isEnrolled && onClassSelect(classItem)}
                            style={{
                                opacity: isEnrolled ? 0.6 : 1,
                                cursor: isEnrolled ? "not-allowed" : "pointer",
                                borderColor: isEnrolled ? "#52c41a" : undefined,
                            }}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <Text strong style={{ fontSize: 16 }}>
                                    {classItem.name}
                                </Text>
                                {isEnrolled && (
                                    <Tag color="success" style={{ marginLeft: 8 }}>
                                        Inscrito
                                    </Tag>
                                )}
                            </div>

                            {/* Nivel + Género */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    marginBottom: 8,
                                }}
                            >
                                <div>
                                    <TrophyOutlined style={{ marginRight: 6, color: "#1890ff" }} />
                                    <Text type="secondary">Nivel: {classItem.level}</Text>
                                </div>

                                {classItem.genre && (
                                    <div>
                                        <TeamOutlined style={{ marginRight: 6, color: "#722ed1" }} />
                                        <Text type="secondary">{classItem.genre}</Text>
                                    </div>
                                )}
                            </div>

                            {/* Día + Hora */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <CalendarOutlined style={{ marginRight: 6, color: "#52c41a" }} />
                                    <Text type="secondary">{classItem.date}</Text>
                                </div>

                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 6, color: "#fa8c16" }} />
                                    <Text type="secondary">{classItem.hour}</Text>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                );

            }}
        />
    );
};

export default AvailableClassesList;
