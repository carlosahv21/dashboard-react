import React, { useContext, useEffect } from "react";
import { List, Avatar, Button, Typography, Empty, Card, Breadcrumb } from "antd";
import { BellOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { NotificationContext } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useFormatting from "../../hooks/useFormatting";

const { Title, Text } = Typography;

const Notifications = () => {
    const { t, i18n } = useTranslation();
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isDarkMode = localStorage.getItem("theme") === "dark"; // Or get from context if available
    const { formatRelativeTime } = useFormatting();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <div style={{ padding: "24px" }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    {t("menu.dashboard") || "Dashboard"}
                </Breadcrumb.Item>
                <Breadcrumb.Item>{t("notifications.title") || "Notificaciones"}</Breadcrumb.Item>
            </Breadcrumb>

            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {t("notifications.title") || "Notificaciones"}
                        </Title>
                        {notifications.length > 0 && (
                            <Button type="primary" onClick={markAllAsRead} icon={<CheckOutlined />}>
                                {t("notifications.markAllRead") || "Marcar todas como leídas"}
                            </Button>
                        )}
                    </div>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={notifications}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={t("notifications.emptyDescription") || "No tienes notificaciones"}
                            />
                        ),
                    }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                !item.is_read && (
                                    <Button
                                        key="read"
                                        type="text"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(item.id);
                                        }}
                                        icon={<CheckOutlined />}
                                    >
                                        {t("notifications.markAsRead") || "Marcar leída"}
                                    </Button>
                                ),
                                <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(item.id);
                                    }}
                                    icon={<CloseOutlined />}
                                >
                                    {t("settings.delete") || "Eliminar"}
                                </Button>,
                            ]}
                            style={{
                                cursor: item.deep_link ? "pointer" : "default",
                                backgroundColor: item.is_read ? "transparent" : (isDarkMode ? "#2a2a2a" : "#f0faff"),
                                padding: "16px",
                                borderRadius: 8,
                                marginBottom: 8,
                                transition: "all 0.3s",
                                border: item.is_read ? "1px solid transparent" : "1px solid #1890ff40"
                            }}
                            className="notification-item"
                            onClick={() => {
                                if (!item.is_read) markAsRead(item.id);
                                if (item.deep_link) navigate(item.deep_link);
                            }}
                            onMouseEnter={(e) => {
                                if (item.deep_link) {
                                    e.currentTarget.style.backgroundColor = isDarkMode ? "#333" : "#e6f7ff";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = item.is_read
                                    ? "transparent"
                                    : (isDarkMode ? "#2a2a2a" : "#f0faff");
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        icon={<BellOutlined />}
                                        style={{
                                            backgroundColor: item.is_read
                                                ? (isDarkMode ? "#333" : "#ccc")
                                                : "#1890ff",
                                        }}
                                    />
                                }
                                title={
                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                        <Text strong={!item.is_read} style={{ fontSize: 16 }}>
                                            {item.title}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {formatRelativeTime(item.created_at)}
                                        </Text>
                                    </div>
                                }
                                description={
                                    <div style={{ marginTop: 4 }}>
                                        <Text>{item.body || item.message}</Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default Notifications;
