import React from "react";
import { Avatar, Tag, Button, Upload, theme } from "antd";
import DetailCard from "../../../components/Common/DetailCard";
import {
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const ProfileHeaderCard = ({
  data,
  isEditing,
  setIsEditing,
  profileForm,
  uploading,
  handleCustomUpload,
  t,
}) => {
  const { token } = theme.useToken();
  const roleLabel = t(`roles.${data.role?.toLowerCase()}`, { defaultValue: data.role });

  return (
    <DetailCard
      style={{
        overflow: "hidden",
        marginBottom: 24,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          height: 160,
          background: token.colorPrimary,
          position: "relative",
          zIndex: 1,
        }}
      />

      <div
        style={{
          padding: "0 32px 32px",
          marginTop: -60,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 16,
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                padding: 5,
                background: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Avatar
                size={120}
                src={data.photo || data.avatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#f0f2f5" }}
              />
            </div>
            <div
              style={{ position: "absolute", bottom: 5, right: 5, zIndex: 10 }}
            >
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
                  title={t("settings.changePhoto")}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                />
              </Upload>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {data.first_name} {data.last_name}
                  </h1>
                  <Tag
                    color="blue"
                    style={{ borderRadius: 12, padding: "2px 12px" }}
                  >
                    <SafetyCertificateOutlined /> {roleLabel}
                  </Tag>
                </div>
                <p style={{ margin: "4px 0", color: token.colorTextSecondary, fontSize: 16 }}>
                  <MailOutlined /> {data.email}
                </p>
                <Tag
                  color={data.email_verified ? "success" : "orange"}
                  style={{
                    borderRadius: 12,
                    border: "none",
                    background: data.email_verified ? "#e6f4ea" : "#fff7e6",
                    color: data.email_verified ? "#1e8e3e" : "#d48806",
                  }}
                >
                  {data.email_verified ? t('global.verified') : t('global.notVerified')}
                </Tag>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!isEditing ? (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    style={{ borderRadius: 8 }}
                  >
                    {t("global.edit")}
                  </Button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setIsEditing(false);
                        profileForm.resetFields();
                      }}
                      style={{ borderRadius: 8 }}
                    >
                      {t("global.cancel")}
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => profileForm.submit()}
                      style={{ borderRadius: 8 }}
                    >
                      {t("global.save")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

export default ProfileHeaderCard;
