import React from 'react';
import { Row, Col, Divider, Typography } from 'antd';
import DynamicInput from './DynamicInput';

const FormSection = ({ title, fields, form, onImageUpload }) => (
    <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col span={24}>
            <Divider style={{ marginTop: 0, marginBottom: 24 }} />
        </Col>
        <Col xs={24} sm={24} md={6}>
            <Typography.Text strong style={{ fontSize: '16px' }}>{title}</Typography.Text>
        </Col>
        <Col xs={24} sm={24} md={18}>
            {fields.map((field, index) => (
                <DynamicInput
                    key={field.name || `${field.label}-${index}`}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    options={field.options || []}
                    relationConfig={field.relation_config}
                    form={form}
                    required={field.required}
                    placeholder={field.placeholder}
                    onImageUpload={onImageUpload}
                />
            ))}
        </Col>
    </Row>
);

export default FormSection;
