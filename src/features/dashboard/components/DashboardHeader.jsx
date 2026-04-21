import React from 'react';
import { Row, Col, Typography, DatePicker, Space, theme } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * DashboardHeader Component
 * Displays a welcome message and a global date range picker.
 */
const DashboardHeader = ({ user, dateRange, onDateRangeChange, settings, academy }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const isDarkMode = settings?.theme === "dark";

    // Custom format for the range display
    const rangePresets = [
        { label: t('dateRange.today'), value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: t('dateRange.yesterday'), value: [dayjs().subtract(1, 'd').startOf('day'), dayjs().subtract(1, 'd').endOf('day')] },
        { label: t('dateRange.last7Days'), value: [dayjs().subtract(7, 'd'), dayjs()] },
        { label: t('dateRange.last30Days'), value: [dayjs().subtract(30, 'd'), dayjs()] },
        { label: t('dateRange.thisMonth'), value: [dayjs().startOf('month'), dayjs().endOf('month')] },
        { label: t('dateRange.lastMonth'), value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    ];

    return (
        <div style={{ marginBottom: 24, marginTop: 8 }}>
            <Row justify="space-between" align="middle" gutter={[24, 24]}>
                <Col xs={24} md={16}>
                    <Space direction="vertical" size={4}>
                        <Title level={1} style={{ 
                            margin: 0, 
                            fontWeight: 700, 
                            letterSpacing: '-0.5px',
                            fontSize: '36px',
                            lineHeight: 1.2
                        }}>
                            {t('dashboard.welcome')}, <span style={{ 
                                background: `linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>{user?.name || t('global.admin')}</span>
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px', fontWeight: 400, opacity: 0.7 }}>
                            {t('dashboard.subtitle', {academyName : academy.name})} 
                        </Text>
                    </Space>
                </Col>
                <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                        padding: '12px 20px',
                        background: token.colorBgContainer,
                        borderRadius: '16px',
                        boxShadow: isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.18)'}`,
                        minWidth: '280px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ 
                            fontSize: '14px',
                            color: token.colorTextSecondary, 
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <CalendarOutlined style={{ color: token.colorPrimary }} />
                            {t('dashboard.period')}
                        </div>
                        <RangePicker
                            value={dateRange}
                            onChange={onDateRangeChange}
                            presets={rangePresets}
                            bordered={false}
                            suffixIcon={null}
                            placeholder={[t('global.start'), t('global.end')]}
                            style={{ 
                                padding: 0, 
                                width: '100%',
                                fontWeight: 600,
                                fontSize: '15px'
                            }}
                            format="DD MMM, YYYY"
                            allowClear={false}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHeader;
