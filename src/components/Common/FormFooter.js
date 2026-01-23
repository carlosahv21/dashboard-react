import React from 'react';
import { Button, Form } from 'antd';
import { useTranslation } from 'react-i18next';

const FormFooter = ({ onSave, onCancel }) => {
    const { t } = useTranslation();

    return (
        <Form.Item style={{ marginTop: '20px', textAlign: 'right', marginRight: '20px' }}>
            <Button type="default" onClick={onCancel} style={{ marginRight: '8px' }}>
                {t('global.cancel')}
            </Button>
            <Button type="primary" onClick={onSave}>
                {t('global.save')}
            </Button>
        </Form.Item>
    );
};

export default FormFooter;
