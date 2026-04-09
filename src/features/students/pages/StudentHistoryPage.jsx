import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Card, Tabs, Button, Tag, Typography,
    Table, Statistic, Tooltip, theme, Form, Modal,
    Spin, App, Input, Space
} from "antd";
import {
    LeftOutlined, ClockCircleOutlined, CreditCardOutlined,
    PauseCircleOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

// Hooks y Componentes Propios
import useFetch from "../../../hooks/useFetch";
import { useFormModal } from "../../../hooks/useFormModal";
import useFormatting from "../../../hooks/useFormatting";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import FormSection from "../../../components/Common/FormSection";
import { useTranslation } from "react-i18next";

// Lógica separada (La crearemos abajo)
import studentService from "../services/studentService";
import { useHistoryColumns } from "../hooks/useHistoryColumns";
import "../StudentHistory.css";

const { Title, Text } = Typography;

const StudentHistory = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { request } = useFetch();
    const { token } = theme.useToken();
    const { message } = App.useApp();
    const { formatCurrency, formatDateShort } = useFormatting();

    // Columnas de tabla extraídas a un Hook para limpieza
    const { attendanceColumns, paymentColumns } = useHistoryColumns();

    const [student, setStudent] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [pauseReason, setPauseReason] = useState("");

    const [form] = Form.useForm();

    const fetchAllData = useCallback(async () => {
        try {
            const data = await studentService.getFullHistory(id);
            setStudent(data.student);
            setActivePlan(data.activePlan);
            setAttendances(data.attendances);
            setPayments(data.payments);
        } catch (error) {
            message.error(t('global.error_fetching'));
        }
    }, [id, t, message]);

    useEffect(() => {
        if (id) fetchAllData();
    }, [id, fetchAllData]);

    const { modalVisible, moduleData, openModal, closeModal, handleSubmit } = useFormModal(
        request, "payments", "payments", t('students.payment'), { user_id: id }, form
    );

    const handleFormSubmit = async (values) => {
        if (await handleSubmit(values)) fetchAllData();
    };

    const handlePausePlan = async () => {
        if (!pauseReason.trim()) return message.error(t('students.pauseNoteRequired'));
        try {
            await studentService.pausePlan(activePlan.id, pauseReason);
            message.success(t('students.pauseSuccess'));
            setIsPauseModalOpen(false);
            setPauseReason("");
            fetchAllData();
        } catch (error) {
            message.error(error.message || t('students.pauseError'));
        }
    };

    const events = attendances.map((att) => ({
        id: att.id,
        title: `${att.class_name} ${att.status === "present" ? "(P)" : "(A)"}`,
        date: dayjs(att.date).format("YYYY-MM-DD"),
        display: 'block',
        backgroundColor: att.status === "present" ? token.colorSuccess : token.colorError,
        extendedProps: { ...att }
    }));

    const tabItems = [
        {
            key: "1",
            label: t('students.paymentsHistory'),
            children: <Table columns={paymentColumns} dataSource={payments} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
        },
        {
            key: "2",
            label: t('students.attendances'),
            children: <Table columns={attendanceColumns} dataSource={attendances} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
        },
    ];

    return (
        <div className="student-history-container">
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
                <Button type="text" icon={<LeftOutlined />} onClick={() => navigate("/students")} style={{ marginRight: 16 }}>
                    {t('students.back')}
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    {t('students.history', { name: `${student?.first_name || ''} ${student?.last_name || ''}` })}
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title={t('students.activitiesCalendar')}>
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            height="auto"
                            eventContent={(info) => (
                                <Tooltip title={info.event.title}>
                                    <div className={`fc-custom-event ${info.event.extendedProps.status}`}>
                                        {info.event.title}
                                    </div>
                                </Tooltip>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Card
                            title={t('students.currentPlan')}
                            extra={<Tag color={activePlan?.status === "active" ? "green" : "red"}>{activePlan?.status || t('students.inactive')}</Tag>}
                            actions={[
                                activePlan?.status === "active" ? (
                                    <Button danger icon={<PauseCircleOutlined />} onClick={() => setIsPauseModalOpen(true)}>
                                        {t('students.pausePlan')}
                                    </Button>
                                ) : (
                                    <Button type="primary" icon={<CreditCardOutlined />} onClick={() => openModal()}>
                                        {t('students.renewPlan')}
                                    </Button>
                                )
                            ]}
                        >
                            {activePlan ? (
                                <div style={{ textAlign: "center" }}>
                                    <Title level={4}>{activePlan.name}</Title>
                                    <Text>{t('students.expires')}: {formatDateShort(activePlan.end_date)}</Text>
                                    <Row gutter={16} style={{ marginTop: 20 }}>
                                        <Col span={12}>
                                            <Statistic title={t('students.classesRemaining')} value={activePlan.max_classes === 0 ? t('students.unlimited') : activePlan.classes_remaining} prefix={<ClockCircleOutlined />} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title={t('students.nextPayment')} value={formatCurrency(activePlan.price || 0)} />
                                        </Col>
                                    </Row>
                                </div>
                            ) : <Text type="secondary">{t('students.noActivePlan')}</Text>}
                        </Card>

                        <Card title={t('students.details')} bodyStyle={{ padding: '0 12px' }}>
                            <Tabs defaultActiveKey="1" items={tabItems} />
                        </Card>
                    </Space>
                </Col>
            </Row>

            {/* Modal de Pago / Renovación */}
            <Modal open={modalVisible} footer={null} width={800} onCancel={() => closeModal(false)} destroyOnClose>
                {moduleData ? (
                    <>
                        <FormHeader title={t('students.createPayment')} onSave={() => form.submit()} onCancel={() => closeModal(false)} />
                        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ padding: 20 }}>
                            {moduleData.blocks?.map(block => (
                                <FormSection
                                    key={block.block_id}
                                    title={block.block_name}
                                    fields={block.fields.filter(f => f.name !== 'user_id')}
                                />
                            ))}
                            <FormFooter onCancel={() => closeModal(false)} onSave={() => form.submit()} />
                        </Form>
                    </>
                ) : <Spin style={{ width: '100%', padding: 50 }} />}
            </Modal>

            {/* Modal de Pausa */}
            <Modal
                title={<Space><ExclamationCircleOutlined style={{ color: token.colorError }} />{t('students.pausePlan')}</Space>}
                open={isPauseModalOpen}
                onOk={handlePausePlan}
                onCancel={() => setIsPauseModalOpen(false)}
                okButtonProps={{ danger: true }}
            >
                <Text>{t('students.pausePlanConfirm')}</Text>
                <Input.TextArea rows={4} value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} style={{ marginTop: 16 }} placeholder={t('students.pausePlaceholder')} />
            </Modal>
        </div>
    );
};

export default StudentHistory;