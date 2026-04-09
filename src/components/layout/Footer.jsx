import React from "react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

const { Footer } = Layout;

/**
 * Footer Component
 * Modernized to .jsx with safe character handling.
 */
const FooterComponent = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    
    return (
        <Footer style={{ textAlign: 'center', padding: '20px' }}>
            {"©"}{currentYear} {t('system.name')} - {t('system.version')} | Created by Carlosahv
        </Footer>
    );
};

export default FooterComponent;
