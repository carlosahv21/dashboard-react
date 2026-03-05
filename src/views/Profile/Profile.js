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
                    <Col xs={24} lg={16}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 8,
                                boxShadow: token.boxShadowTertiary,
                                position: "relative"
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <div style={{
                                height: 160,
                                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                                borderRadius: "8px 8px 0 0",
                            }} />

                            <div style={{ padding: "0 32px 32px", marginTop: -60 }}>
                                <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 24, flexWrap: 'wrap', gap: 24 }}>
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        <div style={{
                                            padding: 4,
                                            background: token.colorBgContainer,
                                            borderRadius: "50%",
                                            display: "inline-block"
                                        }}>
                                            <Avatar
                                                size={120}
                                                src={data.photo || data.avatar}
                                                icon={<UserOutlined />}
                                                style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
                                            />
                                        </div>
                                        <div style={{ position: "absolute", bottom: 0, right: 0 }}>
                                            <Upload
                                                customRequest={handleCustomUpload}
                                                showUploadList={false}
                                                accept="image/*"
                                            >
                                                <Button
                                                    shape="circle"
                                                    icon={<UploadOutlined />}
                                                    type="primary"
                                                    loading={uploading}
                                                    title={t('settings.changePhoto')}
                                                />
                                            </Upload>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 200, paddingBottom: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: "bold", color: token.colorText }}>
                                                        {data.first_name} {data.last_name}
                                                    </h1>
                                                    <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ margin: 0, fontSize: 13, padding: "2px 10px", borderRadius: 12 }}>
                                                        {roleLabel || "Usuario"}
                                                    </Tag>
                                                </div>

                                                <p style={{ margin: "4px 0 0", color: token.colorTextSecondary, fontSize: 16 }}>
                                                    {data.email}
                                                    {data.email_verified !== undefined && (
                                                        <Tag color={data.email_verified ? "success" : "warning"} style={{ marginLeft: 8, border: 'none' }}>
                                                            {data.email_verified ? "Verificado" : "No Verificado"}
                                                        </Tag>
                                                    )}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {!isEditing ? (
                                                    <Button
                                                        icon={<EditOutlined />}
                                                        onClick={() => setIsEditing(true)}
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
                                                        >
                                                            {t('global.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            icon={<SaveOutlined />}
                                                            onClick={() => profileForm.submit()}
                                                        >
                                                            {t('global.save')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Divider style={{ margin: '0 0 24px 0' }} />

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
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('students.lastName')} name="last_name" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('settings.phoneNumber')} name="phone">
                                                    <Input prefix={<PhoneOutlined />} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('settings.email')} name="email">
                                                    <Input prefix={<MailOutlined />} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('settings.gender')} name="gender">
                                                    <Select>
                                                        <Option value="male">Masculino</Option>
                                                        <Option value="female">Femenino</Option>
                                                        <Option value="other">Otro</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('settings.birthDate')} name="birth_date">
                                                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                ) : (
                                    <Descriptions title={t('global.detail')} column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} labelStyle={{ fontWeight: "bold" }}>
                                        <Descriptions.Item label={t('settings.phoneNumber')}>{data.phone || "N/A"}</Descriptions.Item>
                                        <Descriptions.Item label={t('settings.gender')}>
                                            {data.gender ? (data.gender === 'M' ? "Masculino" : data.gender === 'F' ? "Femenino" : data.gender) : "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('settings.birthDate')}>
                                            {data.birth_date ? formatDate(data.birth_date) : "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('settings.email')}>{data.email || "N/A"}</Descriptions.Item>
                                        <Descriptions.Item label={t('settings.joined')}>
                                            {formatDate(data.created_at)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('settings.lastLogin')}>
                                            {data.last_login ? formatDate(data.last_login, true) : "Nunca"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                )}

                                {data.plan && (
                                    <>
                                        <Divider />
                                        <div style={{ marginTop: 24 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>Plan Actual</h3>
                                            <Card
                                                type="inner"
                                                title={data.plan.name}
                                                extra={<Tag color={data.plan.status === 'active' ? 'green' : 'red'}>{data.plan.status === 'active' ? "Activo" : "Inactivo"}</Tag>}
                                                style={{ backgroundColor: token.colorBgLayout }}
                                            >
                                                <Descriptions column={2}>
                                                    {data.plan.description && (
                                                        <Descriptions.Item label="Descripción" span={2}>
                                                            {data.plan.description}
                                                        </Descriptions.Item>
                                                    )}
                                                    <Descriptions.Item label="Inicio">{formatDate(data.plan.start_date)}</Descriptions.Item>
                                                    <Descriptions.Item label="Fin">{formatDate(data.plan.end_date)}</Descriptions.Item>
                                                    <Descriptions.Item label="Clases">{data.plan.classes_used} / {data.plan.classes_total}</Descriptions.Item>
                                                    <Descriptions.Item label="Precio">${data.plan.price}</Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title={<span><LockOutlined /> {t('settings.changePassword')}</span>}
                            bordered={false}
                            style={{
                                borderRadius: 8,
                                boxShadow: token.boxShadowTertiary,
                                height: "fit-content"
                            }}
                        >
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handlePasswordChange}
                            >
                                <Form.Item
                                    label={t('settings.currentPassword')}
                                    name="currentPassword"
                                    rules={[{ required: true, message: t('forms.requiredField') }]}
                                >
                                    <Input.Password placeholder="********" />
                                </Form.Item>

                                <Form.Item
                                    label={t('settings.newPassword')}
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: t('forms.requiredField') },
                                        { min: 6, message: t('auth.passwordMinLength') }
                                    ]}
                                >
                                    <Input.Password placeholder="********" />
                                </Form.Item>

                                <Form.Item
                                    label={t('settings.confirmPassword')}
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
                                    <Input.Password placeholder="********" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        {t('settings.changePassword')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Content>
    );
};

export default Profile;
