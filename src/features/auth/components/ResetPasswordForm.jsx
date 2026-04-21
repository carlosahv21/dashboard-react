import React from "react";
import { Form, Input, Button } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = ({ onFinish, loading, t }) => {
  const navigate = useNavigate();

  return (
    <div className="login-form-container">
      <div style={{ marginBottom: "0" }}>
        <h1 className="login-title">{t("auth.resetPasswordTitle")}</h1>
        <p className="login-subtitle">{t("auth.resetPasswordInstructions")}</p>
        <div className="login-divider"></div>
      </div>

      <Form
        name="reset_password"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          label={t("auth.newPasswordLabel")}
          name="password"
          rules={[
            { required: true, message: t("auth.passwordRequired") },
            { min: 6, message: t("auth.passwordMinLength") },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="input-icon" />}
            placeholder={t("auth.passwordPlaceholder")}
            className="dance-input"
          />
        </Form.Item>

        <Form.Item
          label={t("settings.confirmPassword")}
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: t("forms.requiredField") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("settings.passwordMismatch")));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="input-icon" />}
            placeholder={t("auth.passwordPlaceholder")}
            className="dance-input"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="login-submit-btn"
            block
          >
            {t("auth.resetPasswordButton")}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/login")}
            className="forgot-password-link"
          >
            {t("students.back")} {t("auth.signInButton")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
