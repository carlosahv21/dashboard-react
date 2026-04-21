import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Typography, Spin, message, Form, Button,
    Card, Statistic, List, Tag, Divider, Space, theme,
    Input, Modal
} from "antd";
import {
    LeftOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    HistoryOutlined,
    PauseCircleOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import studentService from "../services/studentService";
import profileService from "../../profile/services/profileService";
import useFormatting from "../../../hooks/useFormatting";

// Reusing components from Profile feature
import ProfileHeaderCard from "../../profile/components/ProfileHeaderCard";
import ProfileDetailsCard from "../../profile/components/ProfileDetailsCard";
import { useFormModal } from "../../../hooks/useFormModal";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import FormSection from "../../../components/Common/FormSection";

const { Title, Text } = Typography;

const StudentProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const { formatCurrency, formatDateShort } = useFormatting();
    const [profileForm] = Form.useForm();
    const [paymentForm] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [pauseReason, setPauseReason] = useState("");

    const { modalVisible, moduleData, openModal, closeModal, handleSubmit } = useFormModal(
        "payments", "payments", t('students.payment'), { user_id: id }, paymentForm
    );

    const handlePaymentSubmit = async (values) => {
        if (await handleSubmit(values)) fetchStudentData();
    };

    const handlePausePlan = async () => {
        if (!pauseReason.trim()) return message.error(t('students.pauseNoteRequired'));
        try {
            await studentService.pausePlan(activePlan.id, pauseReason);
            message.success(t('students.pauseSuccess'));
            setIsPauseModalOpen(false);
            setPauseReason("");
            fetchStudentData();
        } catch (error) {
            message.error(error.message || t('students.pauseError'));
        }
    };

    const fetchStudentData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await studentService.getFullHistory(id);

            // Adapt data to match ProfileHeaderCard structure
            const normalizedStudent = {
                ...data.student,
                full_name: `${data.student.first_name} ${data.student.last_name}`,
                role_label: 'student',
                role: 'student'
            };

            setStudentData({
                ...data,
                student: normalizedStudent
            });
            profileForm.setFieldsValue(normalizedStudent);
        } catch (error) {
            console.error("Error fetching student profile:", error);
            message.error(t("global.error_fetching"));
        } finally {
            setLoading(false);
        }
    }, [id, profileForm, t]);

    useEffect(() => {
        if (id) fetchStudentData();
    }, [id, fetchStudentData]);

    const handleProfileUpdate = async (values) => {
        try {
            await studentService.updateStudent(id, values);
            setStudentData((prev) => ({
                ...prev,
                student: { ...prev.student, ...values, full_name: `${values.first_name} ${values.last_name}` }
            }));
            setIsEditing(false);
            message.success(t("global.update_success"));
        } catch (error) {
            console.error("Error updating student:", error);
            message.error(t("global.update_error"));
        }
    };

    const handleCustomUpload = async ({ file, onSuccess, onError }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const uploadResponse = await profileService.uploadImage(formData);
            const imageUrl = uploadResponse.data?.url || uploadResponse.data?.data?.url;

            await studentService.updateStudent(id, { photo: imageUrl });
            setStudentData((prev) => ({
                ...prev,
                student: { ...prev.student, photo: imageUrl }
            }));
            onSuccess(null, { url: imageUrl });
            message.success(t("global.upload_success"));
        } catch (error) {
            console.error("Upload error:", error);
            onError(error);
            message.error(t("global.upload_error"));
        } finally {
            setUploading(false);
        }
    };

    if (loading || !studentData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    const { student, activePlan, payments } = studentData;

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => navigate("/students")}
                        style={{ marginRight: 12 }}
                    />
                    <Title level={3} style={{ margin: 0 }}>{t('global.detail', { title: t('students.name_singular') })}</Title>
                </div>
                <Button
                    icon={<HistoryOutlined />}
                    onClick={() => navigate(`/students/${id}/history`)}
                >
                    {t('global.history')}
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <ProfileHeaderCard
                        data={student}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        profileForm={profileForm}
                        uploading={uploading}
                        handleCustomUpload={handleCustomUpload}
                        t={t}
                    />

                    <ProfileDetailsCard
                        data={student}
                        isEditing={isEditing}
                        profileForm={profileForm}
                        handleProfileUpdate={handleProfileUpdate}
                        t={t}
                    />
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Plan Activo */}
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
                                        {activePlan ? t('students.renewPlan') : t('students.assignPlan', { defaultValue: 'Asignar Plan' })}
                                    </Button>
                                )
                            ]}
                        >
                            {activePlan ? (
                                <div style={{ textAlign: "center" }}>
                                    <Title level={4} style={{ marginBottom: 4 }}>{activePlan.name}</Title>
                                    <Text type="secondary">{t('students.expires')}: {formatDateShort(activePlan.end_date)}</Text>

                                    <Divider style={{ margin: '16px 0' }} />

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic
                                                title={t('students.classesRemaining')}
                                                value={activePlan.max_classes === 0 ? "∞" : activePlan.classes_remaining}
                                                prefix={<ClockCircleOutlined />}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title={t('students.nextPayment')}
                                                value={formatCurrency(activePlan.price || 0)}
                                                prefix={<CreditCardOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "20px 0" }}>
                                    <Text type="secondary">{t('students.noActivePlan')}</Text>
                                </div>
                            )}
                        </Card>

                        {/* Últimos Pagos */}
                        <Card
                            title={
                                <Space>
                                    <HistoryOutlined />
                                    {t('students.recentPayments', { defaultValue: "Últimos Pagos" })}
                                </Space>
                            }
                            bodyStyle={{ padding: '0 12px' }}
                        >
                            <List
                                dataSource={payments.slice(0, 5)}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={<Text strong>{formatCurrency(item.amount)}</Text>}
                                            description={formatDateShort(item.payment_date)}
                                        />
                                        <Tag color={item.status === 'completed' ? 'green' : 'orange'}>
                                            {item.status}
                                        </Tag>
                                    </List.Item>
                                )}
                            />
                            {payments.length > 5 && (
                                <Button type="link" block onClick={() => navigate(`/students/${id}/history`)}>
                                    {t('global.viewAll')}
                                </Button>
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>

            {/* Modal de Pago / Renovación */}
            <Modal open={modalVisible} footer={null} width={800} onCancel={() => closeModal(false)} destroyOnClose>
                {moduleData ? (
                    <>
                        <FormHeader title={t('students.createPayment')} onSave={() => paymentForm.submit()} onCancel={() => closeModal(false)} />
                        <Form form={paymentForm} layout="vertical" onFinish={handlePaymentSubmit} style={{ padding: 20 }}>
                            {moduleData.blocks?.map(block => (
                                <FormSection
                                    key={block.block_id}
                                    title={block.block_name}
                                    fields={block.fields.filter(f => f.name !== 'user_id')}
                                />
                            ))}
                            <FormFooter onCancel={() => closeModal(false)} onSave={() => paymentForm.submit()} />
                        </Form>
                    </>
                ) : <div style={{ padding: 50, textAlign: 'center' }}><Spin /></div>}
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

export default StudentProfilePage;
