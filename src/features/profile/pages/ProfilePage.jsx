import React, { useContext } from "react";
import { Row, Col, theme, Typography, Spin, message, Form } from "antd";
import { AuthContext } from "../../../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useTranslation } from "react-i18next";

// Components (To be created)
import ProfileHeaderCard from "../components/ProfileHeaderCard";
import ProfileDetailsCard from "../components/ProfileDetailsCard";
import ProfilePlanCard from "../components/ProfilePlanCard";
import ChangePasswordCard from "../components/ChangePasswordCard";
import SupportCard from "../components/SupportCard";

const { Title } = Typography;

const ProfilePage = () => {
  const { user, setUser, settings } = useContext(AuthContext);
  const { t } = useTranslation();
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();

  const {
    profileData,
    loading,
    uploading,
    isEditing,
    setIsEditing,
    updateProfile,
    updatePassword,
    uploadPhoto,
  } = useProfile(user, profileForm);

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(t("settings.passwordMismatch"));
      return;
    }
    const success = await updatePassword(values, user.email);
    if (success) passwordForm.resetFields();
  };

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      const url = await uploadPhoto(file, setUser);
      onSuccess(null, { url });
    } catch (error) {
      onError(error);
    }
  };

  if (loading && !profileData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const data = profileData || user || {};

  return (
    <div style={{ minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
          {t("profile.title") || "Perfil"}
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Section */}
        <Col xs={24} lg={16}>
          <ProfileHeaderCard
            data={data}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            profileForm={profileForm}
            uploading={uploading}
            handleCustomUpload={handleCustomUpload}
            t={t}
          />

          <ProfileDetailsCard
            data={data}
            isEditing={isEditing}
            profileForm={profileForm}
            handleProfileUpdate={updateProfile}
            t={t}
            settings={settings}
          />

          {data.plan && <ProfilePlanCard plan={data.plan} t={t} settings={settings} />}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <ChangePasswordCard
            form={passwordForm}
            onFinish={handlePasswordChange}
            t={t}
          />
          <SupportCard settings={settings} t={t} />
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
