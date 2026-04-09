import React from 'react';
import { Button, Form, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const FormFooter = ({ onSave, onCancel, loading = false, htmlType, style }) => {
    const { t } = useTranslation();

    return (
        <Form.Item style={{ marginTop: '24px', textAlign: 'right', ...style }}>
            <Space>
                {onCancel && (
                    <Button type="default" onClick={onCancel}>
                        {t('global.cancel')}
                    </Button>
                )}
                <Button 
                    type="primary" 
                    onClick={onSave} 
                    loading={loading}
                    htmlType={htmlType || (onSave ? "button" : "submit")}
                >
                    {t('global.save')}
                </Button>
            </Space>
        </Form.Item>
    );
};

export default FormFooter;
