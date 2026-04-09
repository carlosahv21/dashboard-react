import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const LoginForm = ({ onFinish, loading, t }) => {
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
          <a className="forgot-password-link" href="javascript:void(0)">
            {t("auth.forgotPassword")}
          </a>
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
          <a href="javascript:void(0)">{t("auth.contactAdmin")}</a> {t("auth.accessHelp")}
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
