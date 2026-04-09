import React from 'react';
import { Row, Col, Typography, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const FormHeader = ({ title, subtitle, onSave, onCancel, loading = false, style }) => {
    const { t } = useTranslation();
    
    return (
        <Row 
            style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px',
                ...style 
            }}
        >
            <Col>
                <Title level={2} style={{ marginBottom: 4, marginTop: 0 }}>
                    {title}
                </Title>
                {subtitle && <Text type="secondary">{subtitle}</Text>}
            </Col>
            
            {onSave && onCancel && (
                <Col>
                    <Space>
                        <Button type="default" onClick={onCancel}>
                            {t('global.cancel')}
                        </Button>
                        <Button type="primary" onClick={onSave} loading={loading}>
                            {t('global.save')}
                        </Button>
                    </Space>
                </Col>
            )}
        </Row>
    );
};

export default FormHeader;