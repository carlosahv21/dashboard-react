import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Typography, Spin, message, Button,
    Statistic, Table, Tag, Divider, Space, Avatar, theme, Modal, Form
} from "antd";
import {
    TeamOutlined,
    CalendarOutlined,
    ProjectOutlined,
    EditOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../context/AuthContext";
import planService from "../services/planService";
import { useFormModal } from "../../../hooks/useFormModal";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import FormSection from "../../../components/Common/FormSection";
import SupportCard from "../../profile/components/SupportCard";
import PageHeaderActions from "../../../components/Common/PageHeaderActions";
import EntityHeaderCard from "../../../components/Common/EntityHeaderCard";
import DetailCard from "../../../components/Common/DetailCard";

const { Text } = Typography;

const PlanDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { settings } = React.useContext(AuthContext);
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [planData, setPlanData] = useState(null);

    const fetchPlanData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await planService.getPlanDetails(id);
            // Ajuste según estructura de respuesta
            const data = response.data?.data || response.data || response;
            setPlanData(data);
        } catch (error) {
            console.error("Error fetching plan details:", error);
            message.error(t("global.error_fetching"));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        if (id) fetchPlanData();
    }, [id, fetchPlanData]);

    const { modalVisible, moduleData, openModal, closeModal, handleSubmit } = useFormModal(
        "plans", "plans", t('plans.name_singular'), {}, form
    );

    const handleEditSubmit = async (values) => {
        const success = await handleSubmit(values);
        if (success) fetchPlanData();
    };

    if (loading || !planData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    // Assuming data structure based on Classes module and updated backend
    const {
        name, description, price, type, active,
        trial_period_days, max_sessions, max_classes,
        students = []
    } = planData;

    const studentColumns = [
        {
            title: t('students.name_singular'),
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text, record) => (
                <Space onClick={() => navigate(`/students/${record.id}/profile`)} style={{ cursor: 'pointer' }}>
                    <Avatar
                        size="small"
                        icon={<TeamOutlined />}
                        style={{ backgroundColor: "rgba(10, 132, 255, 0.1)", color: token.colorPrimary }}
                    />
                    <Text strong>{text || record.name || 'Alumno'}</Text>
                </Space>
            )
        },
        {
            title: t('students.status') || t('global.status') || 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' || status === 'ACTIVO' ? "green" : "orange"} style={{ borderRadius: 12 }}>
                    {status === 'active' || status === 'ACTIVO' ? t('global.active') : status}
                </Tag>
            )
        },
        {
            title: t('registrations.date') || 'Fecha Registro',
            dataIndex: 'joined_at',
            key: 'joined_at',
            render: (date) => <Text type="secondary">{date ? new Date(date).toLocaleDateString() : '-'}</Text>
        },
        {
            title: t('global.actions') || 'Acciones',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Button type="link" size="small" onClick={() => navigate(`/students/${record.id}/profile`)}>
                    {t('global.viewDetail')}
                </Button>
            )
        }
    ];

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Page Header */}
            <PageHeaderActions 
                title={t('global.detail', { title: t('plans.name_singular') })}
                extraActions={
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => openModal(id)}
                        style={{ borderRadius: 8 }}
                    >
                        {t('global.edit')}
                    </Button>
                }
            />

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN: Header and Student List */}
                <Col xs={24} lg={16}>
                    {/* Plan Header Card */}
                    <EntityHeaderCard
                        title={name}
                        subtitle={description}
                        icon={<ProjectOutlined />}
                        avatarShape="square"
                        tags={
                            <Tag color={active ? "green" : "red"} style={{ borderRadius: 10 }}>
                                {active ? t('global.active') : t('global.inactive')}
                            </Tag>
                        }
                    />

                    {/* Students List */}
                    <DetailCard
                        title={t('students.name_plural')}
                        icon={<TeamOutlined />}
                        extra={<Tag color="cyan" style={{ borderRadius: 10 }}>{students.length} {t('global.total')}</Tag>}
                        bodyStyle={{ padding: 0 }}
                    >
                        <Table
                            columns={studentColumns}
                            dataSource={students}
                            pagination={{ pageSize: 10, size: 'small' }}
                            rowKey="id"
                            locale={{ emptyText: t('global.noData') }}
                        />
                    </DetailCard>
                </Col>

                {/* RIGHT COLUMN: Price and Features */}
                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Price Card */}
                        <DetailCard
                            style={{
                                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
                                color: '#fff'
                            }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <Statistic
                                title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{t('plans.price') || 'Precio'}</Text>}
                                value={price}
                                prefix="$"
                                valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 36 }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 4 }}>
                                    {type === 'package' ? t('plans.type_package') : t('plans.type_subscription')}
                                </Tag>
                            </div>
                        </DetailCard>

                        {/* Plan Config */}
                        <DetailCard
                            title={t('plans.configuration')}
                            icon={<CalendarOutlined />}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">{t('plans.max_sessions')}</Text>
                                    <Text strong>{max_sessions || t('global.noLimit')}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">{t('plans.max_classes')}</Text>
                                    <Text strong>{max_classes || t('global.noLimit')}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">{t('plans.trial_period')}</Text>
                                    <Text>{trial_period_days} {t('global.days') || 'días'}</Text>
                                </div>

                                <Divider style={{ margin: '8px 0' }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {active ? <CheckCircleOutlined style={{ color: token.colorSuccess }} /> : <CloseCircleOutlined style={{ color: token.colorError }} />}
                                    <Text strong>{active ? t('plans.available') : t('plans.not_available')}</Text>
                                </div>
                            </Space>
                        </DetailCard>
                        {/* Support Section */}
                        <SupportCard settings={settings} t={t} />
                    </Space>
                </Col>
            </Row>

            {/* Modal de Edición de Plan */}
            <Modal open={modalVisible} footer={null} width={800} onCancel={() => closeModal(false)} destroyOnClose>
                {moduleData ? (
                    <>
                        <FormHeader
                            title={t('global.editTitle', { title: t('plans.name_singular') })}
                            onSave={() => form.submit()}
                            onCancel={() => closeModal(false)}
                        />
                        <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ padding: 20 }}>
                            {moduleData.blocks?.map(block => (
                                <FormSection
                                    key={block.block_id}
                                    title={block.block_name}
                                    fields={block.fields}
                                />
                            ))}
                            <FormFooter onCancel={() => closeModal(false)} onSave={() => form.submit()} />
                        </Form>
                    </>
                ) : <div style={{ padding: 50, textAlign: 'center' }}><Spin /></div>}
            </Modal>
        </div>
    );
};

export default PlanDetailsPage;
