import React, { useState, useEffect, useCallback } from "react";
import { Tabs, List, Empty, Spin, Button, message, App } from "antd";
import { UserAddOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import connectionService from "../services/connectionService";
import ConnectionCard from "../components/ConnectionCard";
import AddConnectionModal from "../components/AddConnectionModal";

const ConnectionsPage = () => {
    const { t } = useTranslation();
    const { modal } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);
    const [requests, setRequests] = useState([]);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            const [connRes, reqRes] = await Promise.all([
                connectionService.getConnections({ status: "accepted" }),
                connectionService.getRequests({ status: "pending" }),
            ]);
            setConnections(connRes.data?.data || []);
            setRequests(reqRes.data?.data || []);
        } catch (err) {
            message.error(t("global.error_fetching"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const handleAccept = async (id) => {
        try {
            await connectionService.acceptRequest(id);
            message.success(t("connections.accepted"));
            fetchConnections();
        } catch (err) {
            message.error(err.message || t("connections.acceptError"));
        }
    };

    const handleReject = async (id) => {
        modal.confirm({
            title: t("connections.rejectConfirm"),
            okText: t("connections.reject"),
            okType: "danger",
            cancelText: t("global.cancel"),
            onOk: async () => {
                try {
                    await connectionService.rejectRequest(id);
                    message.success(t("connections.rejected"));
                    fetchConnections();
                } catch (err) {
                    message.error(err.message || t("connections.rejectError"));
                }
            },
        });
    };

    const handleRemove = async (id) => {
        modal.confirm({
            title: t("connections.removeConfirm"),
            okText: t("connections.remove"),
            okType: "danger",
            cancelText: t("global.cancel"),
            onOk: async () => {
                try {
                    await connectionService.removeConnection(id);
                    message.success(t("connections.removed"));
                    fetchConnections();
                } catch (err) {
                    message.error(err.message || t("connections.removeError"));
                }
            },
        });
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    const tabItems = [
        {
            key: "connections",
            label: (
                <span>
                    <TeamOutlined style={{ marginRight: 6 }} />
                    {t("connections.myConnections")} ({connections.length})
                </span>
            ),
            children: connections.length > 0 ? (
                <List
                    dataSource={connections}
                    renderItem={(item) => (
                        <ConnectionCard
                            connection={item}
                            type="accepted"
                            onRemove={handleRemove}
                        />
                    )}
                />
            ) : (
                <Empty description={t("connections.noConnections")} />
            ),
        },
        {
            key: "requests",
            label: (
                <span>
                    <UserAddOutlined style={{ marginRight: 6 }} />
                    {t("connections.pendingRequests")} ({requests.length})
                </span>
            ),
            children: requests.length > 0 ? (
                <List
                    dataSource={requests}
                    renderItem={(item) => (
                        <ConnectionCard
                            connection={item}
                            type="pending"
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    )}
                />
            ) : (
                <Empty description={t("connections.noPendingRequests")} />
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddModalOpen(true)}
                >
                    {t("connections.sendRequest")}
                </Button>
            </div>

            <Tabs items={tabItems} defaultActiveKey="connections" />

            <AddConnectionModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={fetchConnections}
            />
        </div>
    );
};

export default ConnectionsPage;
