import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useLogin } from "../hooks/useLogin";
import AuthNavbar from "../components/AuthNavbar";
import LoginForm from "../components/LoginForm";
import AuthSlider from "../components/AuthSlider";
import "../styles/Login.css";

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

  const {
    loading,
    currentSlide,
    setCurrentSlide,
    theme,
    toggleTheme,
    slides,
    handleLogin,
  } = useLogin(login, t);

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
            <LoginForm onFinish={handleLogin} loading={loading} t={t} />
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

export default LoginPage;
