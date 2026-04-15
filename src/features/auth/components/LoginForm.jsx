import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Modal } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const LoginForm = ({ onFinish, onForgotPassword, loading, t }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [forgotForm] = Form.useForm();

  const handleForgotSubmit = async (values) => {
    const success = await onForgotPassword(values.email);
    if (success) {
      setIsModalVisible(false);
      forgotForm.resetFields();
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-header" style={{ marginBottom: "0" }}>
        <h1 className="login-title">{t("auth.loginTitle")}</h1>
        <p className="login-subtitle">{t("auth.loginDescription")}</p>
        <div className="login-divider"></div>
      </div>

      <Form
        name="login-form"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label={t("auth.emailLabel")}
          rules={[
            {
              required: true,
              message: t("auth.emailRequired"),
            },
            {
              type: "email",
              message: t("auth.emailInvalid"),
            },
          ]}
          style={{ marginBottom: "0" }}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder={t("auth.emailPlaceholder")}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t("auth.passwordLabel")}
          rules={[
            {
              required: true,
              message: t("auth.passwordRequired"),
            },
            {
              min: 6,
              message: t("auth.passwordMinLength"),
            },
          ]}
          style={{ marginBottom: "10px" }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t("auth.passwordPlaceholder")}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t("auth.rememberMe")}</Checkbox>
          </Form.Item>
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => setIsModalVisible(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#1890ff",
            }}
          >
            {t("auth.forgotPassword")}
          </button>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t("auth.signInButton")}{" "}
            <LoginOutlined
              style={{
                fontSize: "1.2rem",
                marginLeft: "8px",
              }}
            />
          </Button>
        </Form.Item>
      </Form>

      <div className="login-footer-text">
        <p>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#1890ff",
              textDecoration: "underline",
            }}
          >
            {t("auth.contactAdmin")}
          </button>{" "}
          {t("auth.accessHelp")}
        </p>
      </div>
      <Modal
        title={t("auth.forgotPasswordTitle")}
        open={isModalVisible}
        onCancel={() => {
            setIsModalVisible(false);
            forgotForm.resetFields();
        }}
        footer={null}
        centered
        width={450}
      >
        <Form
          form={forgotForm}
          layout="vertical"
          onFinish={handleForgotSubmit}
          size="large"
        >
          <p style={{ marginBottom: 24, color: "#666" }}>
            {t("auth.requestResetInstructions")}
          </p>
          <Form.Item
            name="email"
            label={t("auth.emailLabel")}
            rules={[
              { required: true, message: t("auth.emailRequired") },
              { type: "email", message: t("auth.emailInvalid") },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t("auth.emailPlaceholder")} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t("auth.sendResetEmailButton")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginForm;
