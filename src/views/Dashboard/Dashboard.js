import React from "react";
import { Card, Typography, Row, Col } from "antd";

const { Title, Paragraph } = Typography;

const DashboardHome = () => {
    return (
        <div>
            <Title level={2}>Welcome to the Dashboard</Title>
            <Paragraph>This is the main overview of your application.</Paragraph>

            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card title="Statistics" bordered={false}>
                        <p>Overview of statistics</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Recent Activities" bordered={false}>
                        <p>List of recent activities</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Quick Actions" bordered={false}>
                        <p>Shortcut links to common actions</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;
