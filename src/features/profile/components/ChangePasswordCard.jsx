import React from "react";
import { Card, Form, Input, Button, theme } from "antd";
import { LockOutlined } from "@ant-design/icons";

const ChangePasswordCard = ({ form, onFinish, t }) => {
  const { token } = theme.useToken();
  return (
    <Card
      title={
        <span>
          <LockOutlined style={{ color: token.colorPrimary, marginRight: 8 }} /> {t("settings.changePassword")}
        </span>
      }
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        marginBottom: 24,
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label={t("settings.currentPassword")}
          name="currentPassword"
          rules={[{ required: true, message: t("forms.requiredField") }]}
        >
          <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label={t("settings.newPassword")}
          name="newPassword"
          rules={[
            { required: true, message: t("forms.requiredField") },
            { min: 6, message: t("auth.passwordMinLength") },
          ]}
        >
          <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label={t("settings.confirmPassword")}
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: t("forms.requiredField") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("settings.passwordMismatch")));
              },
            }),
          ]}
        >
          <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<LockOutlined />}
            block
            style={{ borderRadius: 8, height: 45, fontWeight: "500" }}
          >
            {t("settings.changePassword")}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordCard;
