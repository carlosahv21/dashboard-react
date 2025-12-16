import { Row, Col, Button, Typography } from 'antd';

const FormHeader = ({ title, subtitle, onSave, onCancel }) => (
    <Row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' , padding: '0px 0px 0px' }}>
        <Col>
            <Typography.Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>{title}</Typography.Title>
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </Col>
        {onSave && onCancel && (
            <Col style={{ marginRight: '40px' }}>
                <Button type="default" onClick={onCancel} style={{ marginRight: '8px' }}>Cancel</Button>
                <Button type="primary" onClick={onSave}>Save</Button>
            </Col>
        )}
    </Row>
);

export default FormHeader;