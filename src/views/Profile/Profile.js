import React, { useEffect, useState, useContext } from "react";
import { Layout, Card, Avatar, Descriptions, Tag, Spin, Row, Col, theme, Divider, Button, Form, Input, message, Upload, DatePicker, Select } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined, UploadOutlined, LockOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import useFormatting from "../../hooks/useFormatting";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Content } = Layout;
const { Option } = Select;

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const { request, loading } = useFetch();
    const { formatDate } = useFormatting();
    const { t } = useTranslation();
    const { token } = theme.useToken();

    const [profileData, setProfileData] = useState(null);
    const [passwordForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const response = await request(`students/details/${user.id}`, "GET");
                    const data = response.data || response;
                    setProfileData(data);

                    // Pre-fill form
                    profileForm.setFieldsValue({
                        ...data,
                        birth_date: data.birth_date ? dayjs(data.birth_date) : null,
                    });
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };

        fetchProfile();
    }, [user, request, profileForm]);

    const handlePasswordChange = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error(t('settings.passwordMismatch'));
            return;
        }

        try {
            await request("auth/reset-password", "POST", {
                current_password: values.currentPassword,
                new_password: values.newPassword,
                email: user.email
            });
            message.success(t('settings.updatePasswordSuccess'));
            passwordForm.resetFields();
        } catch (error) {
            console.error("Error updating password:", error);
            message.error(t('settings.updatePasswordError'));
        }
    };

    const handleProfileUpdate = async (values) => {
        try {
            const formattedValues = {
                ...values,
                birth_date: values.birth_date ? values.birth_date.format("YYYY-MM-DD") : null,
            };

            await request(`students/${user.id}`, "PUT", formattedValues);

            setProfileData(prev => ({ ...prev, ...formattedValues }));
            setIsEditing(false);
            message.success(t('settings.updateSuccess'));
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error(t('settings.updateError'));
        }
    };

    const handleCustomUpload = async ({ file, onSuccess, onError }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const uploadResponse = await request("images", "POST", formData);
            const imageUrl = uploadResponse.url || uploadResponse.data.url;

            await request(`students/${user.id}`, "PUT", { photo: imageUrl });

            setProfileData(prev => ({ ...prev, photo: imageUrl }));
            setUser(prev => ({ ...prev, photo: imageUrl }));

            message.success(t('settings.updateSuccess'));
            onSuccess(null, uploadResponse);
        } catch (error) {
            console.error("Upload error:", error);
            message.error(t('forms.uploadImageError'));
            onError(error);
        } finally {
            setUploading(false);
        }
    };

    if (loading && !profileData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    const data = profileData || user || {};
    const roleLabel = data.role === 'admin' ? t('roles.admin') : (data.role === 'student' ? t('roles.student') : data.role);
    const address = [data.address, data.city, data.state, data.country].filter(Boolean).join(", ");

    return (
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Row gutter={[24, 24]}>
                    {/* Main Section */}
                    <Col xs={24} lg={16}>
                        {/* Header Card */}
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                overflow: "hidden",
                                marginBottom: 24
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <div style={{
                                height: 160,
                                background: "#007bff", // Bright blue banner
                                position: "relative",
                                zIndex: 1
                            }} />

                            <div style={{ padding: "0 32px 32px", marginTop: -60, position: "relative", zIndex: 2 }}>
                                <div style={{ display: "flex", alignItems: "flex-end", flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        <div style={{
                                            padding: 5,
                                            background: "#fff",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                        }}>
                                            <Avatar
                                                size={120}
                                                src={data.photo || data.avatar}
                                                icon={<UserOutlined />}
                                                style={{ backgroundColor: "#f0f2f5" }}
                                            />
                                        </div>
                                        <div style={{ position: "absolute", bottom: 5, right: 5, zIndex: 10 }}>
                                            <Upload
                                                customRequest={handleCustomUpload}
                                                showUploadList={false}
                                                accept="image/*"
                                            >
                                                <Button
                                                    shape="circle"
                                                    icon={<UploadOutlined />}
                                                    type="primary"
                                                    size="middle"
                                                    loading={uploading}
                                                    title={t('settings.changePhoto')}
                                                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                                                />
                                            </Upload>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200, paddingBottom: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: "bold", color: "#fff" }}>
                                                        {data.first_name} {data.last_name}
                                                    </h1>
                                                    <Tag color="blue" style={{ borderRadius: 12, padding: "2px 12px" }}>
                                                        <SafetyCertificateOutlined /> {roleLabel || "Estudiante"}
                                                    </Tag>
                                                </div>
                                                <p style={{ margin: "4px 0", color: "#666", fontSize: 16 }}>
                                                    <MailOutlined /> {data.email}
                                                </p>
                                                <Tag color={data.email_verified ? "success" : "orange"} style={{ borderRadius: 12, border: 'none', background: data.email_verified ? '#e6f4ea' : '#fff7e6', color: data.email_verified ? '#1e8e3e' : '#d48806' }}>
                                                    {data.email_verified ? "Verificado" : "No Verificado"}
                                                </Tag>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {!isEditing ? (
                                                    <Button
                                                        icon={<EditOutlined />}
                                                        onClick={() => setIsEditing(true)}
                                                        style={{ borderRadius: 8 }}
                                                    >
                                                        {t('global.edit')}
                                                    </Button>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <Button
                                                            danger
                                                            icon={<CloseOutlined />}
                                                            onClick={() => {
                                                                setIsEditing(false);
                                                                profileForm.resetFields();
                                                            }}
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            {t('global.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            icon={<SaveOutlined />}
                                                            onClick={() => profileForm.submit()}
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            {t('global.save')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Details Card */}
                        <Card
                            title={<span style={{ fontWeight: "bold" }}><UserOutlined style={{ color: "#007bff", marginRight: 8 }} /> Detalle del Perfil</span>}
                            bordered={false}
                            style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 24 }}
                        >
                            {isEditing ? (
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleProfileUpdate}
                                    initialValues={{
                                        ...data,
                                        birth_date: data.birth_date ? dayjs(data.birth_date) : null
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label={t('students.firstName')} name="first_name" rules={[{ required: true }]}>
                                                <Input style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('students.lastName')} name="last_name" rules={[{ required: true }]}>
                                                <Input style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('settings.phoneNumber')} name="phone">
                                                <Input prefix={<PhoneOutlined />} style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('settings.email')} name="email">
                                                <Input prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('settings.gender')} name="gender">
                                                <Select style={{ borderRadius: 8 }}>
                                                    <Option value="male">Masculino</Option>
                                                    <Option value="female">Femenino</Option>
                                                    <Option value="other">Otro</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('settings.birthDate')} name="birth_date">
                                                <DatePicker style={{ width: '100%', borderRadius: 8 }} format="YYYY-MM-DD" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            ) : (
                                <Descriptions
                                    column={2}
                                    labelStyle={{ color: "#8c8c8c", fontWeight: "normal", textTransform: "uppercase", fontSize: 12 }}
                                    contentStyle={{ color: "#000", fontWeight: "500", fontSize: 15, paddingBottom: 16 }}
                                >
                                    <Descriptions.Item label="Número de Teléfono">{data.phone || "N/A"}</Descriptions.Item>
                                    <Descriptions.Item label="Género">
                                        {data.gender ? (data.gender === 'M' || data.gender === 'male' ? "Masculino" : "Femenino") : "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Fecha de Nacimiento">
                                        {data.birth_date ? formatDate(data.birth_date) : "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">{data.email || "N/A"}</Descriptions.Item>
                                    <Descriptions.Item label="Miembro desde">{formatDate(data.created_at)}</Descriptions.Item>
                                    <Descriptions.Item label="Último acceso">{data.last_login ? formatDate(data.last_login, true) : "Nunca"}</Descriptions.Item>
                                </Descriptions>
                            )}
                        </Card>

                        {/* Plan Card */}
                        <Card
                            bordered={false}
                            style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                <SafetyCertificateOutlined style={{ color: "#007bff", fontSize: 18 }} />
                                <span style={{ fontWeight: "bold", fontSize: 16 }}>Plan Actual</span>
                            </div>

                            <Card
                                style={{ backgroundColor: "#f0f7ff", borderRadius: 12, border: "1px solid #e6f7ff" }}
                                bodyStyle={{ padding: 24 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>{data.plan.name}</h3>
                                            <Tag color="success" style={{ borderRadius: 12, border: 'none' }}>{data.plan.status}</Tag>
                                        </div>
                                        <p style={{ color: "#666", marginBottom: 20 }}>Acceso a clases grupales presenciales y material de apoyo.</p>

                                        <Row gutter={32}>
                                            <Col>
                                                <div style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase" }}>Vigencia</div>
                                                <div style={{ fontWeight: "500" }}>{formatDate(data.plan.start_date)} - {formatDate(data.plan.end_date)}</div>
                                            </Col>
                                            <Col>
                                                <div style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase" }}>Progreso Clases</div>
                                                <div style={{ fontWeight: "500" }}>{data.plan.classes_used} de {data.plan.classes_total} Usadas</div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 32, fontWeight: "bold", color: "#007bff" }}>${data.plan.price}</div>
                                        <div style={{ color: "#8c8c8c", fontSize: 12 }}>Facturado mensual</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 20 }}>
                                    <div style={{ height: 8, background: "#e6f7ff", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${(data.plan.classes_used / data.plan.classes_total) * 100}%`, height: "100%", background: "#007bff" }} />
                                    </div>
                                </div>
                            </Card>
                        </Card>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={<span><LockOutlined style={{ color: "#007bff", marginRight: 8 }} /> Cambiar Contraseña</span>}
                            bordered={false}
                            style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 24 }}
                        >
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handlePasswordChange}
                            >
                                <Form.Item
                                    label="Contraseña Actual"
                                    name="currentPassword"
                                    rules={[{ required: true, message: t('forms.requiredField') }]}
                                >
                                    <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
                                </Form.Item>

                                <Form.Item
                                    label="Nueva Contraseña"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: t('forms.requiredField') },
                                        { min: 6, message: t('auth.passwordMinLength') }
                                    ]}
                                >
                                    <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
                                </Form.Item>

                                <Form.Item
                                    label="Confirmar Contraseña"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: t('forms.requiredField') },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error(t('settings.passwordMismatch')));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button type="primary" htmlType="submit" icon={<LockOutlined />} block style={{ borderRadius: 8, height: 45, fontWeight: "500" }}>
                                        Cambiar Contraseña
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>

                        {/* Support Card */}
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                background: "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
                                border: "1px solid #bae7ff"
                            }}
                        >
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#007bff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 20
                                }}>
                                    ?
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: "bold", fontSize: 16 }}>¿Necesitas ayuda?</h4>
                                    <p style={{ margin: "8px 0 16px", color: "#666", fontSize: 14 }}>
                                        Si tienes problemas con tu cuenta, contacta a soporte técnico.
                                    </p>
                                    <Button type="link" style={{ padding: 0, color: "#007bff", fontWeight: "600" }}>
                                        Contactar Soporte →
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Content>
    );
};

export default Profile;
