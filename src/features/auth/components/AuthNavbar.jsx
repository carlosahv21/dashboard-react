import React from "react";
import { ManOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";

const AuthNavbar = ({ theme, toggleTheme, t }) => {
  return (
    <nav className="dance-nav">
      <div className="dance-brand-header">
        <div className="dance-logo-box">
          <ManOutlined style={{ fontSize: "1.5rem" }} />
        </div>
        <span className="dance-nav-title" style={{ fontSize: "1.5rem" }}>
          {t("auth.brandName")}
        </span>
      </div>
      <div className="dance-nav-actions">
        <div className="dance-nav-links">
          <a className="dance-nav-link" href="javascript:void(0)">
            {t("auth.navHome")}
          </a>
          <a className="dance-nav-link" href="javascript:void(0)">
            {t("auth.navClasses")}
          </a>
          <a className="dance-nav-link" href="javascript:void(0)">
            {t("auth.navAcademy")}
          </a>
          <a className="dance-nav-link" href="javascript:void(0)">
            {t("auth.navContact")}
          </a>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? t("auth.themeLight") : t("auth.themeDark")
          }
          title={theme === "dark" ? t("auth.themeLight") : t("auth.themeDark")}
        >
          {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
        </button>
      </div>
    </nav>
  );
};

export default AuthNavbar;
