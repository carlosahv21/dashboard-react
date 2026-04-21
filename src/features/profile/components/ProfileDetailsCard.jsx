import React from "react";
import { Descriptions, Form, Row, Col, Input, Select, DatePicker, theme } from "antd";
import DetailCard from "../../../components/Common/DetailCard";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useFormatting from "../../../hooks/useFormatting";

const { Option } = Select;

const ProfileDetailsCard = ({
  data,
  isEditing,
  profileForm,
  handleProfileUpdate,
  t,
  settings,
}) => {
  const { token } = theme.useToken();
  const { formatDate } = useFormatting();

  return (
    <DetailCard
      title={t("profile.details")}
      icon={<UserOutlined />}
      style={{
        marginBottom: 24,
      }}
    >
      {isEditing ? (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={{
            ...data,
            birth_date: data.birth_date ? dayjs(data.birth_date) : null,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t("students.firstName")}
                name="first_name"
                rules={[{ required: true }]}
              >
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("students.lastName")}
                name="last_name"
                rules={[{ required: true }]}
              >
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("settings.phoneNumber")} name="phone">
                <Input prefix={<PhoneOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("settings.email")} name="email">
                <Input prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("settings.gender")} name="gender">
                <Select style={{ borderRadius: 8 }}>
                  <Option value="male">{t('settings.genders.male')}</Option>
                  <Option value="female">{t('settings.genders.female')}</Option>
                  <Option value="other">{t('settings.genders.other')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("settings.birthDate")} name="birth_date">
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <Descriptions
          column={2}
          labelStyle={{
            color: token.colorTextSecondary,
            fontWeight: "normal",
          }}
          contentStyle={{
            color: token.colorText,
            fontWeight: "500",
            paddingBottom: 16,
          }}
        >
          <Descriptions.Item label={t("settings.phoneNumber")}>
            {data.phone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={t("settings.gender")}>
            {data.gender
              ? data.gender === "M" || data.gender === "male"
                ? t('settings.genders.male')
                : t('settings.genders.female')
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={t("settings.birthDate")}>
            {data.birth_date ? formatDate(data.birth_date) : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={t("settings.email")}>
            {data.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={t("settings.memberSince")}>
            {formatDate(data.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label={t("settings.lastAccess")}>
            {data.last_login ? formatDate(data.last_login, true) : t('global.never')}
          </Descriptions.Item>
        </Descriptions>
      )}
    </DetailCard>
  );
};

export default ProfileDetailsCard;
