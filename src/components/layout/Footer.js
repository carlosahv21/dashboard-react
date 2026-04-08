import React from "react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

const { Footer } = Layout; // Usamos Footer, no Foo

const FooterComponent = () => {
    const { t } = useTranslation();
    return (
        <Footer style={{ textAlign: 'center', padding: '20px' }}>
            {`©${new Date().getFullYear()} ${t('system.name')} - ${t('system.version')} | Created by Carlosahv`}
        </Footer>
    );
};

export default FooterComponent;
