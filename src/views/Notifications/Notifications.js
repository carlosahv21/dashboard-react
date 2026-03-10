import React, { useContext, useEffect } from "react";
import { List, Avatar, Button, Typography, Empty, Card, Badge, Tooltip, Space, Row, Col, Statistic, Spin } from "antd";
import {
    CheckOutlined,
    DeleteOutlined,
    CheckCircleFilled,
    WalletFilled,
    InfoCircleFilled,
    CalendarOutlined,
    DollarOutlined,
    LineChartOutlined,
    UserAddOutlined,
    TrophyOutlined
} from "@ant-design/icons";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useFormatting from "../../hooks/useFormatting";
import { useNotificationsSidebarData } from "../../hooks/useNotificationsSidebarData";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Notifications = () => {
    const { t } = useTranslation();
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useContext(NotificationContext);
    const { settings, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isDarkMode = settings?.theme === "dark";
    const { formatRelativeTime, formatCurrency } = useFormatting();

    const { agendaData, middleData, bottomData, loading: sidebarLoading } = useNotificationsSidebarData();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getNotificationType = (item) => {
        const title = (item.title || "").toLowerCase();
        if (title.includes("calificaci") || title.includes("nota") || title.includes("éxito") || title.includes("completado")) {
            return { icon: <CheckCircleFilled />, color: "#52c41a", bg: "#f6ffed" };
        }
        if (title.includes("pago") || title.includes("cuota") || title.includes("alerta") || title.includes("vencimiento")) {
            return { icon: <WalletFilled />, color: "#faad14", bg: "#fff7e6" };
        }
        return { icon: <InfoCircleFilled />, color: "#1890ff", bg: "#e6f7ff" };
    };

    return (
        <div style={{
            minHeight: "100vh"
        }}>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32
            }}>
                <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
                    {t("notifications.title") || "Notificaciones"}
                </Title>
                {notifications.length > 0 && (
                    <Button
                        type="primary"
                        size="large"
                        onClick={markAllAsRead}
                        icon={<CheckOutlined />}
                        style={{ borderRadius: "10px" }}
                    >
                        {t("notifications.markAllRead") || "Marcar todas como leídas"}
                    </Button>
                )}
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <List
                        loading={loading}
                        dataSource={notifications}
                        split={false}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={t("notifications.emptyDescription") || "No tienes notificaciones"}
                                />
                            ),
                        }}
                        renderItem={(item) => {
                            const { icon, color, bg } = getNotificationType(item);
                            return (
                                <List.Item style={{ padding: 0, marginBottom: 20 }}>
                                    <Card
                                        bordered={true}
                                        style={{
                                            width: "100%",
                                            borderRadius: "16px",
                                            boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                            border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                            cursor: item.deep_link ? "pointer" : "default",
                                        }}
                                        bodyStyle={{ padding: "20px 24px" }}
                                        onClick={() => {
                                            if (!item.is_read) markAsRead(item.id);
                                            if (item.deep_link) navigate(item.deep_link);
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                            {/* Avatar/Icon Section */}
                                            <Avatar
                                                size={52}
                                                icon={icon}
                                                style={{
                                                    backgroundColor: isDarkMode ? "#2d2d2d" : bg,
                                                    color: color,
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "24px",
                                                    border: isDarkMode ? `1px solid ${color}40` : "none"
                                                }}
                                            />

                                            {/* Content Section */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                    <Text strong style={{
                                                        fontSize: "16px",
                                                        color: isDarkMode ? "#fff" : "#262626"
                                                    }}>
                                                        {item.title}
                                                    </Text>
                                                    {!item.is_read && <Badge status="processing" color="#1890ff" />}
                                                </div>
                                                <div style={{
                                                    fontSize: "14px",
                                                    color: isDarkMode ? "#aaa" : "#595959",
                                                    marginBottom: 6,
                                                    lineHeight: "1.5"
                                                }}>
                                                    {item.body || item.message}
                                                </div>
                                                <Text style={{
                                                    fontSize: "12px",
                                                    color: "#8c8c8c",
                                                    fontWeight: 400
                                                }}>
                                                    {formatRelativeTime(item.created_at)}
                                                </Text>
                                            </div>

                                            {/* Actions Section */}
                                            <Space size={16} align="center">
                                                {!item.is_read && (
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                        <Tooltip title={t("notifications.markAsRead") || "Marcar leída"}>
                                                            <Button
                                                                shape="circle"
                                                                size="large"
                                                                icon={<CheckOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(item.id);
                                                                }}
                                                                style={{
                                                                    backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f2f5",
                                                                    border: "none",
                                                                    color: "#52c41a"
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Text style={{ fontSize: "10px", color: "#8c8c8c", textTransform: "uppercase", fontWeight: 600 }}>
                                                            {t("notifications.readShort") || "LEÍDO"}
                                                        </Text>
                                                    </div>
                                                )}
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                    <Tooltip title={t("settings.delete") || "Eliminar"}>
                                                        <Button
                                                            shape="circle"
                                                            size="large"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(item.id);
                                                            }}
                                                            style={{
                                                                backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f2f5",
                                                                border: "none"
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Text style={{ fontSize: "10px", color: "#8c8c8c", textTransform: "uppercase", fontWeight: 600 }}>
                                                        {t("settings.deleteShort") || "ELIMINAR"}
                                                    </Text>
                                                </div>
                                            </Space>
                                        </div>
                                    </Card>
                                </List.Item>
                            );
                        }}
                        footer={
                            notifications.length > 0 && (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <Text style={{
                                        fontSize: "14px",
                                        color: "#8c8c8c",
                                        fontStyle: "italic"
                                    }}>
                                        {t("notifications.footerMessage") || "Has visto todas tus notificaciones recientes"}
                                    </Text>
                                </div>
                            )
                        }
                    />
                </Col>

                {/* --- RIGHT SIDEBAR --- */}
                <Col xs={24} lg={8}>
                    <Spin spinning={sidebarLoading}>

                        {/* 1. Sección Superior: "Mi Agenda / Próximas Clases" (Universal) */}
                        {(user.role === "student" || user.role === "teacher" || user.role === "admin") && (
                            <Card
                                title={<span><CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} /> {user.role === "admin" ? "Clases de Hoy" : "Mi Agenda de Hoy"}</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                {agendaData && agendaData.length > 0 ? (
                                    <List
                                        dataSource={agendaData}
                                        renderItem={item => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    title={<Text strong style={{ color: isDarkMode ? "#fff" : "#262626" }}>{item.name}</Text>}
                                                    description={<span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>{`${item.genre || 'Clase'} • Nivel ${item.level || 'Básico'} • ${item.hour || ''}`}</span>}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty description="No hay clases programadas para hoy" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </Card>
                        )}

                        {/* 2. Sección Media: "Estado de Cuenta y Plan" (Segmentada) */}
                        {user.role === "student" && (
                            <Card
                                title={<span><DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} /> Estado de Cuenta y Plan</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                {middleData ? (
                                    <div style={{ textAlign: "center" }}>
                                        <Statistic
                                            title="Clases Restantes"
                                            value={middleData.classes_remaining || 0}
                                            suffix={middleData.max_classes ? `/ ${middleData.max_classes}` : ''}
                                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                                        />
                                        <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                                            Tu plan vence el: {dayjs(middleData.end_date).format('DD MMM YYYY')}
                                        </Text>
                                    </div>
                                ) : (
                                    <Empty description="No tienes un plan activo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </Card>
                        )}

                        {user.role === "teacher" && (
                            <Card
                                title={<span><CheckCircleFilled style={{ marginRight: 8, color: '#1890ff' }} /> Ratio de Asistencia</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <Statistic
                                        title="Porcentaje de Asistencia a tus Clases"
                                        value={middleData?.ratio || 0}
                                        precision={1}
                                        suffix="%"
                                        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                                    />
                                </div>
                            </Card>
                        )}

                        {user.role === "admin" && (
                            <Card
                                title={<span><DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} /> Recaudación del Día</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <Statistic
                                        title="Total Hoy"
                                        value={formatCurrency(middleData?.revenue || 0, settings)}
                                        valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                                    />
                                </div>
                            </Card>
                        )}

                        {/* 3. Sección Inferior: "Actividad Reciente / KPI" (Segmentada) */}
                        {user.role === "student" && bottomData && (
                            <Card
                                title={<span><LineChartOutlined style={{ marginRight: 8, color: '#eb2f96' }} /> Asistencia Semanal</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                {bottomData.present === 0 && bottomData.absent === 0 ? (
                                    <Empty description="No hay clases esta semana" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                ) : (
                                    <ReactECharts
                                        option={{
                                            tooltip: { trigger: 'item' },
                                            legend: { bottom: 0, textStyle: { color: isDarkMode ? '#fff' : '#333' } },
                                            series: [{
                                                name: 'Asistencia',
                                                type: 'pie',
                                                radius: ['40%', '70%'],
                                                data: [
                                                    { value: bottomData.present, name: 'Asistidas', itemStyle: { color: '#52c41a' } },
                                                    { value: bottomData.absent, name: 'Ausencias', itemStyle: { color: '#f5222d' } }
                                                ]
                                            }]
                                        }}
                                        style={{ height: '250px' }}
                                    />
                                )}
                            </Card>
                        )}

                        {user.role === "teacher" && bottomData?.topClasses && (
                            <Card
                                title={<span><TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} /> Mayor Inscripción</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                <List
                                    dataSource={bottomData.topClasses}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar style={{ backgroundColor: index === 0 ? '#faad14' : '#1890ff', color: '#fff' }}>{index + 1}</Avatar>}
                                                title={<Text strong style={{ color: isDarkMode ? "#fff" : "#262626" }}>{item.name}</Text>}
                                                description={<span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>{item.studentCount} activos</span>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}

                        {user.role === "admin" && (
                            <Card
                                title={<span><UserAddOutlined style={{ marginRight: 8, color: '#13c2c2' }} /> Nuevos Estudiantes</span>}
                                style={{
                                    marginBottom: 20,
                                    borderRadius: "16px",
                                    boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
                                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title={<span style={{ color: isDarkMode ? "#aaa" : "#595959" }}>Registrados esta semana</span>}
                                        value={bottomData?.newStudentsCount || 0}
                                        valueStyle={{ color: '#13c2c2', fontWeight: 'bold', fontSize: '32px' }}
                                    />
                                </div>
                            </Card>
                        )}

                    </Spin>
                </Col>
            </Row>
        </div>
    );
};

export default Notifications;

