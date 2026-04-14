import React from "react";
import { useTranslation } from "react-i18next";
import { useResetPassword } from "../hooks/useResetPassword";
import AuthNavbar from "../components/AuthNavbar";
import ResetPasswordForm from "../components/ResetPasswordForm";
import AuthSlider from "../components/AuthSlider";
import LoadingScreen from "../../../components/Common/LoadingScreen";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    verifying,
    isValid,
    loading,
    currentSlide,
    setCurrentSlide,
    theme,
    toggleTheme,
    slides,
    handleResetPassword
  } = useResetPassword(t);

  if (verifying) {
    return <LoadingScreen />;
  }

  return (
    <div className="dance-login-container" data-theme={theme}>
      <AuthNavbar theme={theme} toggleTheme={toggleTheme} t={t} />

      <main className="dance-main">
        <div className="login-left-panel">
          <div
            className="dance-bg-pattern"
            style={{ position: "absolute", inset: 0 }}
          ></div>

          <div
            className="login-content-wrapper"
            style={{ width: "100%", maxWidth: "28rem", zIndex: 10 }}
          >
            {isValid ? (
              <ResetPasswordForm 
                onFinish={handleResetPassword} 
                loading={loading} 
                t={t} 
              />
            ) : (
              <div className="login-form-container" style={{ textAlign: 'center' }}>
                <Result
                  status="error"
                  title={t("auth.invalidToken")}
                  subTitle={t("session.expiredTitle")}
                  extra={[
                    <div key="login-wrapper" style={{ maxWidth: '300px', margin: '1.5rem auto 0' }}>
                      <Button 
                        type="primary" 
                        onClick={() => navigate("/login")} 
                        className="login-submit-btn"
                        block
                      >
                        {t("auth.signInButton")}
                      </Button>
                    </div>
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        <AuthSlider
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          t={t}
        />
      </main>
    </div>
  );
};

export default ResetPasswordPage;
