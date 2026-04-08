import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";

// Locales AntD
import es_ES from "antd/locale/es_ES";
import en_US from "antd/locale/en_US";

// Contextos y Config
import "./i18n";
import "./App.css";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { getThemeConfig } from "./config/themeConfig";
import AppRouter from "./routes/AppRouter";

const AppContent = () => {
  const { settings } = useContext(AuthContext);
  const { i18n } = useTranslation();
  
  const isDarkMode = settings?.theme === "dark";
  const currentLang = settings?.language || i18n.language || 'es';
  const antLocale = currentLang.startsWith('en') ? en_US : es_ES;

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#000000" : "#F0F2F5";
  }, [isDarkMode]);

  return (
    <ConfigProvider theme={getThemeConfig(isDarkMode)} locale={antLocale}>
      <AntdApp>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  </AuthProvider>
);