import React, { useContext, useState } from "react";
import { Popover, Badge, Typography, Button, List, Avatar, Empty } from "antd";
import { BellOutlined, CheckCircleFilled, WalletFilled, InfoCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import useFormatting from "../../../hooks/useFormatting";

const NotificationCenter = ({ isDarkMode }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { formatRelativeTime } = useFormatting();
    const [open, setOpen] = useState(false);
    
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        loading 
    } = useContext(NotificationContext);

    const getIcon = (title = "") => {
        const tLower = title.toLowerCase();
        if (tLower.includes("calificaci") || tLower.includes("nota")) {
            return { icon: <CheckCircleFilled />, color: "#52c41a", bg: "#f6ffed" };
        }
        if (tLower.includes("pago") || tLower.includes("cuota") || tLower.includes("wallet")) {
            return { icon: <WalletFilled />, color: "#faad14", bg: "#fff7e6" };
        }
        return { icon: <InfoCircleFilled />, color: "#1890ff", bg: "#e6f7ff" };
    };

    return (
        <Popover
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            overlayInnerStyle={{ padding: 0 }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 360, padding: "16px 16px 8px" }}>
                    <Typography.Text strong style={{ fontSize: 18 }}>{t("notifications.title")}</Typography.Text>
                    <Button type="link" size="small" onClick={markAllAsRead} style={{ padding: 0 }}>
                        {t("notifications.markAllRead")}
                    </Button>
                </div>
            }
            content={
                <div style={{ width: 400, maxHeight: 480, overflowY: 'auto' }}>
                    <List
                        loading={loading}
                        dataSource={notifications.slice(0, 10)}
                        locale={{ emptyText: <Empty description={t("notifications.empty")} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        footer={
                            <div style={{ textAlign: 'center' }}>
                                <Button type="link" onClick={() => { navigate("/notifications"); setOpen(false); }}>
                                    {t("notifications.viewAll")}
                                </Button>
                            </div>
                        }
                        renderItem={(item) => {
                            const { icon, color, bg } = getIcon(item.title);
                            return (
                                <List.Item
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        backgroundColor: item.is_read ? 'transparent' : (isDarkMode ? '#2a2a2a' : '#f0f7ff'),
                                        borderBottom: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`
                                    }}
                                    onClick={() => {
                                        if (!item.is_read) markAsRead(item.id);
                                        if (item.deep_link) { navigate(item.deep_link); setOpen(false); }
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={icon} style={{ backgroundColor: bg, color: color }} />}
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography.Text strong={!item.is_read} style={{ color: isDarkMode ? '#fff' : '#262626' }}>
                                                    {item.title}
                                                </Typography.Text>
                                                {!item.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1890ff', marginTop: 6 }} />}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div style={{ fontSize: 13, color: isDarkMode ? '#aaa' : '#595959' }}>{item.body || item.message}</div>
                                                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>{formatRelativeTime(item.created_at)}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                </div>
            }
        >
            <Badge count={unreadCount} size="small" overflowCount={10}>
                <BellOutlined style={{ fontSize: 18, cursor: "pointer", color: isDarkMode ? "#E0E0E0" : "inherit" }} />
            </Badge>
        </Popover>
    );
};

export default NotificationCenter;
