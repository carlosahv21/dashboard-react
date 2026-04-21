import React from 'react';
import { Button, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PageHeaderActions = ({ title, extraActions, showBackButton = true }) => {
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                {showBackButton && (
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginRight: 12 }}
                    />
                )}
                <Title level={3} style={{ margin: 0 }}>{title}</Title>
            </div>
            {extraActions && (
                <div style={{ display: 'flex', gap: 8 }}>
                    {extraActions}
                </div>
            )}
        </div>
    );
};

export default PageHeaderActions;
