import React from "react";
import { Card, Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";

const ChangePasswordCard = ({ form, onFinish, t }) => {
  return (
    <Card
      title={
        <span>
          <LockOutlined style={{ color: "#007bff", marginRight: 8 }} /> Cambiar
          Contraseña
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
          label="Contraseña Actual"
          name="currentPassword"
          rules={[{ required: true, message: t("forms.requiredField") }]}
        >
          <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label="Nueva Contraseña"
          name="newPassword"
          rules={[
            { required: true, message: t("forms.requiredField") },
            { min: 6, message: t("auth.passwordMinLength") },
          ]}
        >
          <Input.Password placeholder="********" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label="Confirmar Contraseña"
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
            Cambiar Contraseña
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordCard;
