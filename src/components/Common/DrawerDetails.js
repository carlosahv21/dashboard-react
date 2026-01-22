import React from "react";
import { Drawer, Descriptions, Avatar, Divider, theme } from "antd";
import { UserOutlined, MailOutlined, InfoCircleOutlined, CalendarOutlined, SolutionOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// --- Componente Auxiliar: Renderiza una sección ---

const getIconForLabel = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("información")) return <SolutionOutlined style={{ marginRight: 8, color: '#1890ff' }} />;
    if (lowerLabel.includes("registro") || lowerLabel.includes("metadata")) return <CalendarOutlined style={{ marginRight: 8, color: '#40a9ff' }} />;
    return <InfoCircleOutlined style={{ marginRight: 8, color: '#40a9ff' }} />;
};


// Componente que renderiza un bloque de detalles (etiqueta: valor)
const DetailSection = ({ label, items }) => {
    const { token } = theme.useToken();
    if (!items || items.length === 0) return null;

    // Estilo para asegurar que todas las etiquetas Descriptions.Item tengan el mismo ancho
    const labelStyle = { fontWeight: 600, width: 105, color: token.colorTextSecondary };

    return (
        <div style={{ background: token.colorBgContainer, padding: '16px 24px', marginBottom: 8, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 16px 0', fontSize: '14px', color: token.colorText }}>
                {getIconForLabel(label)}
                {label}
            </p>
            <Descriptions column={1} size="small" colon={false}>
                {items.map((item, index) => (
                    <Descriptions.Item
                        key={index}
                        label={<span style={labelStyle}>{item.name}</span>}
                    >
                        {item.render
                            ? item.render(item.value)
                            : (item.value === null || item.value === undefined || item.value === '')
                                ? "-"
                                : item.value
                        }
                    </Descriptions.Item>
                ))}
            </Descriptions>
        </div>
    );
};


// --- Componente principal: DrawerDetails ---

const DrawerDetails = ({ visible, onClose, data }) => {
    const { token } = theme.useToken();
    const { t } = useTranslation();

    if (!data) {
        return (
            <Drawer
                title={t('global.detail')}
                placement="right"
                onClose={onClose}
                open={visible}
                width={400}
                styles={{ body: { padding: 0 } }}
            >
                <div style={{ textAlign: "center", padding: "20px", color: token.colorText }}>
                    {t('global.loadingOrNoData')}
                </div>
            </Drawer>
        );
    }

    // Extracción de datos para el encabezado
    const {
        title,
        subtitle,
        email,
        sections = [] // Aseguramos que sections sea un array por defecto
    } = data;

    const avatarChar = title ? title.charAt(0).toUpperCase() : '?';

    return (
        <Drawer
            title={null}
            placement="right"
            onClose={onClose}
            open={visible}
            size={400}
            styles={{ body: { padding: 0 } }}
        >
            <div style={{ height: '100%', overflowY: 'auto', background: token.colorBgLayout }}>

                {/* Encabezado del Perfil */}
                <div style={{
                    padding: "24px",
                    background: token.colorBgContainer,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                }}>
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        src={"avatar_female.png"} // Soporte para URL de avatar
                        style={{ marginBottom: 8 }}
                    >
                        {avatarChar}
                    </Avatar>
                    <h2 style={{ margin: 0, fontWeight: 600, fontSize: '20px', color: token.colorText }}>
                        {title || t('global.detail')}
                    </h2>
                    <p style={{ color: token.colorTextSecondary, margin: '4px 0 8px 0', fontSize: '14px' }}>
                        {subtitle}
                    </p>
                    {email && (
                        <div style={{ display: 'flex', alignItems: 'center', color: token.colorTextSecondary }}>
                            <MailOutlined style={{ marginRight: 5 }} />
                            {email}
                        </div>
                    )}

                    <Divider style={{ margin: '16px 0 0 0' }} />
                </div>

                {/* Renderizado de Secciones Dinámicas */}
                {sections.map((section, index) => (
                    <DetailSection
                        key={index}
                        label={section.label}
                        items={section.items}
                    />
                ))}

            </div>
        </Drawer>
    );
};

export default DrawerDetails;