import { Row, Col, Divider, Typography } from 'antd';
import DynamicInput from './DynamicInput';

const FormSection = ({ title, fields, form, onImageUpload }) => (
    <Row>
        <Divider />
        <Col span={6}>
            <Typography.Text strong>{title}</Typography.Text>
        </Col>
        <Col span={18}>
            {fields.map((field, index) => (
                <DynamicInput
                    key={field.name || `${field.label}-${index}`}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    options={field.options || []}
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
