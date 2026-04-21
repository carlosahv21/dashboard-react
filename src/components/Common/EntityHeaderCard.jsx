import React from 'react';
import { Card, Avatar, Typography, theme } from 'antd';

const { Title, Text } = Typography;

const EntityHeaderCard = ({ title, subtitle, icon, tags, avatarShape = "square" }) => {
    const { token } = theme.useToken();

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                overflow: "hidden",
                marginBottom: 24,
            }}
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    height: 120,
                    background: token.colorPrimary,
                    position: "relative",
                }}
            />
            <div style={{ padding: "0 32px 32px", marginTop: -40, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ 
                        padding: 4, 
                        background: "#fff", 
                        borderRadius: 12, 
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)" 
                    }}>
                        <Avatar
                            size={100}
                            shape={avatarShape}
                            icon={icon}
                            style={{ 
                                backgroundColor: "#f0f2f5", 
                                color: token.colorPrimary,
                                borderRadius: avatarShape === "square" ? 8 : undefined
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                            <Title level={2} style={{ margin: 0, color: '#333' }}>{title}</Title>
                            {tags && tags}
                        </div>
                        {subtitle && <Text type="secondary">{subtitle}</Text>}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EntityHeaderCard;
