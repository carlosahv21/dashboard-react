import React, { useContext, useEffect } from "react";
import {
  List,
  Button,
  Typography,
  Empty,
  Row,
  Col,
  Spin,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { NotificationContext } from "../../../context/NotificationContext";
import { AuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useFormatting from "../../../hooks/useFormatting";
import { useSidebarData } from "../hooks/useSidebarData";

// Sub-components
import NotificationItem from "../components/NotificationItem";
import AgendaCard from "../components/AgendaCard";
import StatusSummaryCard from "../components/StatusSummaryCard";
import ActivityInsightCard from "../components/ActivityInsightCard";

const { Title, Text } = Typography;

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatRelativeTime, formatCurrency } = useFormatting();
  
  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useContext(NotificationContext);

  const { settings, user, loading: authLoading } = useContext(AuthContext);
  const isDarkMode = settings?.theme === "dark";

  const {
    agendaData,
    middleData,
    bottomData,
    loading: sidebarLoading,
  } = useSidebarData(user, authLoading);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
          {t("notifications.title") || "Notificaciones"}
        </Title>
        {notifications.length > 0 && (
          <Button
            type="primary"
            size="medium"
            onClick={markAllAsRead}
            icon={<CheckOutlined />}
            style={{ borderRadius: "10px" }}
          >
            {t("notifications.markAllRead") || "Marcar todas como leídas"}
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Notifications List Section */}
        <Col xs={24} lg={16}>
          <List
            loading={notificationsLoading}
            dataSource={notifications}
            split={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    t("notifications.emptyDescription") ||
                    "No tienes notificaciones"
                  }
                />
              ),
            }}
            renderItem={(item) => (
              <NotificationItem
                item={item}
                isDarkMode={isDarkMode}
                t={t}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
                navigate={navigate}
                formatRelativeTime={formatRelativeTime}
              />
            )}
            footer={
              notifications.length > 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontStyle: "italic",
                    }}
                  >
                    {t("notifications.footerMessage")}
                  </Text>
                </div>
              )
            }
          />
        </Col>

        {/* Sidebar Insights Section */}
        <Col xs={24} lg={8}>
          <Spin spinning={sidebarLoading}>
            <AgendaCard
              data={agendaData}
              isDarkMode={isDarkMode}
              role={user?.role}
            />

            <StatusSummaryCard
              data={middleData}
              role={user?.role}
              isDarkMode={isDarkMode}
              formatCurrency={formatCurrency}
              settings={settings}
            />

            <ActivityInsightCard
              data={bottomData}
              role={user?.role}
              isDarkMode={isDarkMode}
            />
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default NotificationsPage;
