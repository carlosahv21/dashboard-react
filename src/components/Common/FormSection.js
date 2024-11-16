import { Row, Col, Divider, Typography } from 'antd';
import DynamicInput from './DynamicInput';

const FormSection = ({ title, fields, form }) => (
    <Row style={{ marginBottom: '20px', marginLeft: '20px', marginRight: '20px' }}>
        <Divider />
        <Col span={6}>
            <Typography.Text strong>{title}</Typography.Text>
        </Col>
        <Col span={18}>
            {fields.map(field => (
                <DynamicInput
                    key={field.field_id}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    options={field.options || []}
                    form={form}
                    validation_rules={field.validation_rules}
                    editable={field.editable}
                    readonly={field.readonly}
                    placeholder={field.placeholder}
                    helper_text={field.helper_text}
                />
            ))}
        </Col>
    </Row>
);

export default FormSection;