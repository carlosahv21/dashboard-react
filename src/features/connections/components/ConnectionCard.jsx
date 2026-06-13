import React from "react";
import { Card, Avatar, Button, Space, Typography, theme } from "antd";
import { UserOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const ConnectionCard = ({ connection, type, onAccept, onReject, onRemove }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 12,
                marginBottom: 12,
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "12px 16px" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Space>
                    <Avatar
                        size={40}
                        src={connection.other_avatar}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: token.colorFillAlter }}
                    />
                    <div>
                        <Text strong style={{ fontSize: 14 }}>
                            {connection.other_first_name} {connection.other_last_name}
                        </Text>
                    </div>
                </Space>

                <Space>
                    {type === "pending" && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => onAccept(connection.id)}
                            >
                                {t("connections.accept")}
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => onReject(connection.id)}
                            >
                                {t("connections.reject")}
                            </Button>
                        </>
                    )}
                    {type === "accepted" && (
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => onRemove(connection.id)}
                        >
                            {t("connections.remove")}
                        </Button>
                    )}
                </Space>
            </div>
        </Card>
    );
};

export default ConnectionCard;
