import React from "react";
import { Drawer, Descriptions, Avatar, Divider, theme } from "antd";
import { UserOutlined, MailOutlined, InfoCircleOutlined, CalendarOutlined, SolutionOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFormatting from "../../hooks/useFormatting";

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
    const { formatDate, formatCurrency } = useFormatting();

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

    // --- Normalización de Datos ---
    const normalizeData = (inputData) => {
        // 1. Caso ESTUDIANTE (identificado por role: 'student')
        if (inputData.role === 'student' || (inputData.data && inputData.data.role === 'student')) {
            const d = inputData.data || inputData; // Manejar si viene envuelto en "data" o plano
            return {
                title: `${d.first_name} ${d.last_name}`,
                subtitle: t('roles.student') || "Estudiante", // Traducir si es posible
                email: d.email,
                avatarChar: d.first_name ? d.first_name.charAt(0).toUpperCase() : 'S',
                sections: [
                    {
                        label: "Información Personal",
                        items: [
                            { name: "Email", value: d.email },
                            { name: "Verificado", value: d.email_verified ? "Sí" : "No" },
                            { name: "Registrado", value: formatDate(d.created_at) },
                            { name: "Último Acceso", value: d.last_login ? formatDate(d.last_login, true) : "-" },
                        ]
                    },
                    d.plan ? {
                        label: "Plan Activo",
                        items: [
                            { name: "Nombre", value: d.plan.name },
                            { name: "Estado", value: d.plan.status === 'active' ? "Activo" : "Inactivo" },
                            { name: "Clases Usadas", value: `${d.plan.classes_used} / ${d.plan.classes_total}` },
                            { name: "Vence", value: formatDate(d.plan.end_date) },
                        ]
                    } : null
                ].filter(Boolean)
            };
        }

        // 2. Caso PROFESOR (identificado por header.role_label: 'teacher')
        if (inputData.header && inputData.header.role_label === 'teacher') {
            const h = inputData.header;
            const stats = inputData.stats || {};
            const payment = inputData.payment_summary || {};
            const classes = inputData.weekly_classes || [];

            return {
                title: h.full_name,
                subtitle: t('roles.teacher') || "Profesor",
                email: h.email,
                avatarChar: h.full_name ? h.full_name.charAt(0).toUpperCase() : 'P',
                sections: [
                    {
                        label: "Estadísticas",
                        items: [
                            { name: "Clases", value: stats.classes_count },
                            { name: "Alumnos", value: stats.students_count },
                            { name: "Rating", value: stats.rating ? `${stats.rating} ⭐` : "-" },
                        ]
                    },
                    {
                        label: "Resumen de Pagos",
                        items: [
                            { name: "Pendiente", value: formatCurrency(payment.pending_amount) },
                            { name: "Pagado", value: formatCurrency(payment.paid_amount) },
                            { name: "Próx. Corte", value: payment.next_cutoff_date },
                        ]
                    },
                    classes.length > 0 ? {
                        label: "Clases Semanales",
                        items: classes.map(c => ({
                            name: c.name,
                            value: `${c.schedule} (${c.location})`
                        }))
                    } : null
                ].filter(Boolean)
            };
        }

        // 3. Caso CLASE (identificado por header.genre o estructura específica de clase)
        if (inputData.header && inputData.session_details) {
            const h = inputData.header;
            const session = inputData.session_details;
            const stats = inputData.stats || [];
            const students = inputData.students || [];

            return {
                title: h.title,
                subtitle: h.level_tag,
                email: null, // Clases no tienen email principal
                avatarChar: h.title ? h.title.charAt(0).toUpperCase() : 'C',
                sections: [
                    {
                        label: "Estadísticas",
                        items: stats.map(s => ({ name: s.label, value: s.value }))
                    },
                    {
                        label: "Detalles",
                        items: [
                            { name: "Horario", value: session.time_range },
                            { name: "Duración", value: session.duration_label },
                            { name: "Ubicación", value: `${session.location} - ${session.location_detail}` },
                        ]
                    },
                    students.length > 0 ? {
                        label: "Estudiantes Inscritos",
                        items: students.map(s => ({
                            name: s.full_name,
                            value: (
                                <div>
                                    <div style={{ fontSize: '12px' }}>{s.plan_info}</div>
                                    <div style={{ fontSize: '11px', color: s.has_attended ? 'green' : 'gray' }}>
                                        {s.has_attended ? "Asistió" : "Pendiente"}
                                    </div>
                                </div>
                            ),
                            render: (val) => val // Renderizar el componente React directamente
                        }))
                    } : null
                ].filter(Boolean)
            };
        }

        // 4. Fallback: Datos planos (comportamiento anterior)
        return {
            title: inputData.title || t('global.detail'),
            subtitle: inputData.subtitle || "",
            email: inputData.email,
            avatarChar: inputData.title ? inputData.title.charAt(0).toUpperCase() : '?',
            sections: inputData.sections || []
        };
    };

    const normalizedData = normalizeData(data);

    // Extracción de datos normalizados
    const {
        title,
        subtitle,
        email,
        avatarChar,
        sections
    } = normalizedData;

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
                        src={"avatar_female.png"} // TODO: Manejar avatar dinámico si viene del backend
                        style={{ marginBottom: 8, backgroundColor: token.colorPrimary }}
                    >
                        {avatarChar}
                    </Avatar>
                    <h2 style={{ margin: 0, fontWeight: 600, fontSize: '20px', color: token.colorText }}>
                        {title}
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