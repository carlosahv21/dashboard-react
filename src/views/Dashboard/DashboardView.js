import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const DashboardView = () => {
    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Welcome to Your Dashboard</Title>
            <Paragraph>
                This is your main dashboard view. You can add widgets, stats, or any other content here.
            </Paragraph>
            <Card title="Example Card" style={{ width: 300, marginTop: 20 }}>
                <p>Some example content inside a card.</p>
            </Card>
        </div>
    );
};

export default DashboardView;
