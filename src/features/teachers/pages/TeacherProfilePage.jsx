import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Typography, Spin, message, Form, Button,
    Card, Statistic, List, Tag, Divider, Space
} from "antd";
import {
    LeftOutlined,
    TeamOutlined,
    StarOutlined,
    CalendarOutlined,
    DollarOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import teacherService from "../services/teacherService";
import profileService from "../../profile/services/profileService";
import useFormatting from "../../../hooks/useFormatting";

// Reusing components from Profile feature
import ProfileHeaderCard from "../../profile/components/ProfileHeaderCard";
import ProfileDetailsCard from "../../profile/components/ProfileDetailsCard";

const { Title, Text } = Typography;

const TeacherProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { formatCurrency } = useFormatting();
    const [profileForm] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [teacherData, setTeacherData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                setLoading(true);
                const response = await teacherService.getTeacherDetails(id);
                const data = response.data?.data || response.data || response;
                setTeacherData(data);
                // header contains the base profile info
                profileForm.setFieldsValue(data.header);
            } catch (error) {
                console.error("Error fetching teacher profile:", error);
                message.error(t("global.error_fetching"));
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTeacher();
    }, [id, profileForm, t]);

    const handleProfileUpdate = async (values) => {
        try {
            await teacherService.updateTeacher(id, values);
            setTeacherData((prev) => ({
                ...prev,
                header: { ...prev.header, ...values }
            }));
            setIsEditing(false);
            message.success(t("global.update_success"));
        } catch (error) {
            console.error("Error updating teacher:", error);
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

            await teacherService.updateTeacher(id, { photo: imageUrl });
            setTeacherData((prev) => ({
                ...prev,
                header: { ...prev.header, photo: imageUrl }
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

    if (loading || !teacherData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    const { header, stats, payment_summary, weekly_classes } = teacherData;

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => navigate("/teachers")}
                    style={{ marginRight: 16 }}
                />
                <Title level={2} style={{ margin: 0 }}>
                    {t("teachers.profile", { defaultValue: "Perfil del Profesor" })}
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <ProfileHeaderCard
                        data={header}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        profileForm={profileForm}
                        uploading={uploading}
                        handleCustomUpload={handleCustomUpload}
                        t={t}
                    />

                    <ProfileDetailsCard
                        data={header}
                        isEditing={isEditing}
                        profileForm={profileForm}
                        handleProfileUpdate={handleProfileUpdate}
                        t={t}
                    />
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Quick Stats */}
                        <Card title={t("teachers.quickStats", { defaultValue: "Estadísticas" })}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title={t("teachers.classes", { defaultValue: "Clases" })}
                                        value={stats.classes_count}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t("teachers.studentsCount", { defaultValue: "Alumnos" })}
                                        value={stats.students_count}
                                        prefix={<TeamOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t("teachers.rating", { defaultValue: "Rating" })}
                                        value={stats.rating}
                                        prefix={<StarOutlined />}
                                        precision={1}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Payment Summary */}
                        <Card title={t("teachers.paymentSummary", { defaultValue: "Resumen de Pagos" })}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                <Text type="secondary">{t("teachers.pendingAmount", { defaultValue: "Por Pagar" })}</Text>
                                <Title level={4} style={{ margin: 0, color: '#1e8e3e' }}>
                                    {formatCurrency(payment_summary.pending_amount)}
                                </Title>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                <Text type="secondary">{t("teachers.paidThisMonth", { defaultValue: "Pagado este mes" })}</Text>
                                <Text strong>{formatCurrency(payment_summary.paid_amount)}</Text>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Text type="secondary">{t("teachers.nextCutoff", { defaultValue: "Próximo Corte" })}</Text>
                                <Tag icon={<DollarOutlined />} color="blue">{payment_summary.next_cutoff_date}</Tag>
                            </div>
                        </Card>

                        {/* Weekly Classes */}
                        <Card
                            title={t("teachers.weeklyClasses", { defaultValue: "Clases Semanales" })}
                            styles={{ body: { padding: '0 12px' } }}
                        >
                            <List
                                dataSource={weekly_classes}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={<Text strong>{item.name}</Text>}
                                            description={
                                                <Space direction="vertical" size={0}>
                                                    <Text type="secondary" size="small">{item.schedule}</Text>
                                                    <Tag size="small">{item.genre}</Tag>
                                                </Space>
                                            }
                                        />
                                        <Text type="secondary" size="small">{item.location}</Text>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default TeacherProfilePage;
