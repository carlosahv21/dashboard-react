import React from "react";
import { Drawer, Descriptions, Avatar, Divider, theme, Button, Space, App, Popover } from "antd";
import { UserOutlined, MailOutlined, InfoCircleOutlined, CalendarOutlined, SolutionOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useFormatting from "../../hooks/useFormatting";

// --- Componente Auxiliar: Renderiza una sección ---

const getIconForLabel = (label) => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes("información"))
        return <SolutionOutlined style={{ marginRight: 8, color: '#1890ff' }} />;
    if (lowerLabel.includes("registro") || lowerLabel.includes("metadata"))
        return <CalendarOutlined style={{ marginRight: 8, color: '#40a9ff' }} />;
    return <InfoCircleOutlined style={{ marginRight: 8, color: '#40a9ff' }} />;
};


// Componente que renderiza un bloque de detalles (etiqueta: valor)
const DetailSection = ({ label, items }) => {
    const { token } = theme.useToken();
    if (!items || items.length === 0) return null;

    // Estilo para asegurar que todas las etiquetas Descriptions.Item tengan el mismo ancho
    const labelStyle = { fontWeight: 600, width: 200, color: token.colorTextSecondary };

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

const DrawerDetails = ({ visible, onClose, data, onEdit, onDelete }) => {
    const { token } = theme.useToken();
    const { t } = useTranslation();
    const { formatDate, formatCurrency } = useFormatting();
    const { modal } = App.useApp();

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

    const handleDeleteConfirm = () => {
        const id = data.id || (data.data && data.data.id);
        modal.confirm({
            title: t('global.deleteTitle'),
            content: t('global.deleteConfirm'),
            okText: t('global.yes'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: () => {
                if (onDelete) onDelete(id, data);
                onClose(); // Cerrar el drawer después de borrar
            },
        });
    };

    const handleEdit = () => {
        const id = data.id || (data.data && data.data.id);
        if (onEdit) {
            onEdit(id, data);
            onClose(); // Opcional: Cerrar el drawer al editar si se abre un modal
        }
    };

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
                ].filter(Boolean),
                avatar: d.avatar || d.profile_picture || null
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
                ].filter(Boolean),
                avatar: h.avatar || h.profile_picture || null
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

        // 4. Caso PAGO (identificado por payment_method)
        if (inputData.payment_method && inputData.amount !== undefined) {
            return {
                title: `Pago #${inputData.id}`,
                subtitle: inputData.status === 'completed' ? 'Completado' : inputData.status,
                email: inputData.user?.email,
                avatarChar: '$',
                sections: [
                    {
                        label: "Resumen de Pago",
                        items: [
                            { name: "Monto", value: formatCurrency(inputData.amount) },
                            { name: "Monto Original", value: inputData.amount !== inputData.original_amount ? formatCurrency(inputData.original_amount) : null },
                            { name: "Método", value: inputData.payment_method },
                            { name: "Fecha", value: formatDate(inputData.payment_date) },
                            { name: "Estado", value: inputData.status === 'completed' ? "Completado" : inputData.status },
                        ].filter(item => item.value !== null)
                    },
                    inputData.user ? {
                        label: "Usuario",
                        items: [
                            { name: "Nombre", value: inputData.user.full_name },
                            { name: "Email", value: inputData.user.email },
                        ]
                    } : null,
                    inputData.plan ? {
                        label: "Detalles del Plan",
                        items: [
                            { name: "Plan", value: inputData.plan.name },
                            { name: "Inicio", value: formatDate(inputData.plan.start_date) },
                            { name: "Fin", value: formatDate(inputData.plan.end_date) },
                        ]
                    } : null,
                    (inputData.discount && inputData.discount.value > 0) ? {
                        label: "Descuento",
                        items: [
                            { name: "Tipo", value: inputData.discount.type },
                            { name: "Valor", value: inputData.discount.value },
                            { name: "Notas", value: inputData.discount.notes },
                        ]
                    } : null,
                    inputData.notes ? {
                        label: "Notas",
                        items: [
                            { name: "Detalle", value: inputData.notes }
                        ]
                    } : null
                ].filter(Boolean)
            };
        }

        // 5. Caso PLAN (identificado por name, price, y type)
        if (inputData.price !== undefined && inputData.type && inputData.name) {
            return {
                title: inputData.name,
                subtitle: inputData.active ? 'Activo' : 'Inactivo',
                email: null,
                avatarChar: inputData.name ? inputData.name.charAt(0).toUpperCase() : 'P',
                sections: [
                    {
                        label: "Resumen",
                        items: [
                            { name: "Precio", value: formatCurrency(inputData.price) },
                            { name: "Tipo", value: inputData.type === 'monthly' ? "Mensual" : inputData.type }, // Traducir si es necesario
                            { name: "Días Prueba", value: inputData.trial_period_days > 0 ? `${inputData.trial_period_days} días` : "No aplica" },
                            { name: "Estado", value: inputData.active ? "Activo" : "Inactivo" },
                        ]
                    },
                    {
                        label: "Límites",
                        items: [
                            { name: "Máx. Sesiones", value: inputData.max_sessions || "Ilimitadas" },
                            { name: "Máx. Clases", value: inputData.max_classes || "Ilimitadas" },
                        ]
                    },
                    {
                        label: "Información",
                        items: [
                            { name: "Descripción", value: inputData.description },
                            { name: "Creado", value: formatDate(inputData.created_at) },
                            { name: "Actualizado", value: formatDate(inputData.updated_at) },
                        ]
                    }
                ].filter(Boolean)
            };
        }

        // 6. Caso ROL (identificado por name y description, sin precio)
        if (inputData.name && inputData.description && inputData.price === undefined && !inputData.email) {
            return {
                title: inputData.name.charAt(0).toUpperCase() + inputData.name.slice(1),
                subtitle: t('settings.role') || "Rol",
                email: null,
                avatarChar: inputData.name.charAt(0).toUpperCase(),
                sections: [
                    {
                        label: "Detalles",
                        items: [
                            { name: "Nombre", value: inputData.name },
                            { name: "Descripción", value: inputData.description },
                        ]
                    },
                    {
                        label: "Metadatos",
                        items: [
                            { name: "Creado", value: formatDate(inputData.created_at) },
                            { name: "Actualizado", value: formatDate(inputData.updated_at) },
                        ]
                    }
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
        sections,
        avatar
    } = normalizedData;

    return (
        <Drawer
            title={null}
            placement="right"
            onClose={onClose}
            open={visible}
            size={500}
            styles={{ body: { padding: 0 } }}
            extra={
                <Space>
                    {onEdit && (
                        <Popover content={t('global.edit')} placement="bottom">
                            <Button
                                type="link"
                                style={{ color: "#13a8a8"}}
                                onClick={handleEdit}
                            >
                                <EditOutlined />
                            </Button>
                        </Popover>
                    )}
                    {onDelete && (
                        <Popover content={t('global.delete')} placement="bottom">
                            <Button
                            type="link"
                                danger
                                onClick={handleDeleteConfirm}
                                
                            >
                                <DeleteOutlined />
                            </Button>
                        </Popover>
                    )}
                </Space>
            }
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
                    {avatar && (
                        <Avatar
                            size={80}
                            icon={<UserOutlined />}
                            src={avatar}
                            style={{ marginBottom: 8, backgroundColor: token.colorPrimary }}
                        />
                    )}
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
