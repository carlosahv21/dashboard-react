import React from 'react';
import { Button, Form } from 'antd';

const FormFooter = ({ onSave, onCancel }) => {

    return (
        <Form.Item style={{ marginTop: '20px', textAlign: 'right', marginRight: '20px' }}>
            <Button type="default" onClick={onCancel}  style={{ marginRight: '8px' }}>
                Cancel
            </Button>
            <Button type="primary" onClick={onSave}>
                Save
            </Button>
        </Form.Item>
    );
};

export default FormFooter;
