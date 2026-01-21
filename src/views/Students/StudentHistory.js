import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row,
    Col,
    Card,
    Tabs,
    Button,
    Tag,
    Typography,
    Table,
    Statistic,
    Tooltip,
    theme,
    Form,
    Modal,
    Spin,
    App,
    Input,
    Space,
} from "antd"; 
import {
    LeftOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    PauseCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons"; // Added PauseCircleOutlined
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import useFetch from "../../hooks/useFetch";
import { useFormModal } from "../../hooks/useFormModal";
import FormHeader from "../../components/Common/FormHeader";
import FormFooter from "../../components/Common/FormFooter";
import FormSection from "../../components/Common/FormSection";

const { Title, Text } = Typography;

const StudentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { request } = useFetch();
    const { token } = theme.useToken();
    const { message } = App.useApp(); // Get message instance

    const [student, setStudent] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activePlan, setActivePlan] = useState(null);

    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [pauseReason, setPauseReason] = useState("");

    const [form] = Form.useForm();

    const fetchAllData = React.useCallback(async () => {
        try {
            // Fetch Student Data
            const response = await request(`students/${id}`);
            setStudent(response.data);

            // Fetch Plan Data
            const planResponse = await request(`plans/student/${id}`);
            setActivePlan(planResponse.data);

            // Fetch Attendances
            const attResponse = await request(`attendances?student_id=${id}`);
            setAttendances(attResponse.data || []);

            // Fetch Payments
            const payResponse = await request(`payments?user_id=${id}`);
            setPayments(payResponse.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }, [id, request]);

    useEffect(() => {
        if (id) {
            fetchAllData();
        }
    }, [id, fetchAllData]);

    const {
        modalVisible,
        moduleData,
        openModal,
        closeModal,
        handleSubmit,
    } = useFormModal(
        request,
        "payments",
        13,
        "Pago",
        { user_id: id },
        form
    );

    const handleFormSubmit = async (values) => {
        const shouldRefetch = await handleSubmit(values);
        if (shouldRefetch) {
            fetchAllData();
        }
    };

    const handlePausePlan = async () => {
        if (!pauseReason.trim()) {
            message.error("Por favor, ingresa una nota explicando la razón de la pausa.");
            return;
        }

        try {
            await request(`plans/${activePlan.id}`, "PUT", {
                status: 'paused',
                notes: pauseReason
            });

            message.success("El plan ha sido pausado correctamente.");
            setIsPauseModalOpen(false);
            setPauseReason("");
            fetchAllData();
        } catch (error) {
            message.error(error.message || "Error al pausar el plan.");
        }
    };

    // Map attendances to Calendar Events
    const events = attendances.map((att) => ({
        id: att.id,
        title: att.class_name + (att.status === "present" ? " (P)" : " (A)"),
        date: dayjs(att.date).format("YYYY-MM-DD"),
        classNames: att.status === "present" ? ["event-present"] : ["event-absent"],
        extendedProps: {
            status: att.status,
            fullTitle: att.class_name,
        },
        textColor: "#fff",
        allDay: true,
    }));

    const attendanceColumns = [
        {
            title: "Fecha",
            dataIndex: "date",
            key: "date",
            render: (d) => dayjs(d).format("DD/MM/YYYY"),
        },
        { title: "Clase", dataIndex: "class_name", key: "class_name" },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            render: (status) =>
                status === "present" ? (
                    <Tag color="green">Presente</Tag>
                ) : (
                    <Tag color="red">Ausente</Tag>
                ),
        },
    ];

    const paymentColumns = [
        {
            title: "Fecha",
            dataIndex: "payment_date",
            key: "payment_date",
            render: (d) => dayjs(d).format("DD/MM/YYYY"),
        },
        { title: "Método", dataIndex: "payment_method", key: "payment_method" },
        {
            title: "Monto",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => `$${amount}`,
        },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "completed" ? "green" : "orange"}>{status}</Tag>
            ),
        },
    ];

    const items = [
        {
            key: "1",
            label: "Historial de Pagos",
            children: (
                <Table
                    columns={paymentColumns}
                    dataSource={payments}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 5, placement: ["bottomCenter"] }}
                />
            ),
        },
        {
            key: "2",
            label: "Asistencias",
            children: (
                <Table
                    columns={attendanceColumns}
                    dataSource={attendances}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 5, placement: ["bottomCenter"] }}
                />
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => navigate("/students")}
                    style={{ marginRight: 16 }}
                >
                    Volver
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    Historial de {student?.first_name} {student?.last_name}
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column: Calendar */}
                <Col xs={24} lg={16}>
                    <Card title="Calendario de Actividades" variant={false}>
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth",
                            }}
                            height="auto"
                            eventContent={(eventInfo) => (
                                <Tooltip
                                    title={
                                        <div>
                                            <strong>{eventInfo.event.extendedProps.fullTitle}</strong>
                                            <br />
                                            {eventInfo.event.extendedProps.status === "present"
                                                ? "Presente"
                                                : "Ausente"}{" "}
                                            <br />
                                            {dayjs(eventInfo.event.start).format("DD/MM/YYYY")}
                                        </div>
                                    }
                                >
                                    <div
                                        style={{
                                            padding: "2px 4px",
                                            color: "white",
                                            borderRadius: "4px",
                                            fontSize: "0.85em",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {eventInfo.event.title}
                                    </div>
                                </Tooltip>
                            )}
                        />
                        {/* Inject styles for FullCalendar updates */}
                        <style>
                            {`
                            /* Event Styles */
                            .event-present, .event-present .fc-event-main {
                                background-color: #6abe39 !important;
                                border-color: #6abe39 !important;
                                transition: all 0.3s;
                            }
                            .event-present:hover, .event-present:hover .fc-event-main {
                                background-color: #306317 !important;
                                border-color: #306317 !important;
                            }

                            .event-absent, .event-absent .fc-event-main {
                                background-color: #cf1322 !important;
                                border-color: #cf1322 !important;
                                transition: all 0.3s;
                            }
                            .event-absent:hover, .event-absent:hover .fc-event-main {
                                background-color: #820014 !important; /* Darker red for hover */
                                border-color: #820014 !important;
                            }

                            .fc-col-header-cell-cushion, 
                            .fc-timegrid-slot-label-cushion {
                                color: ${token.colorText} !important;
                            }
                            .fc-theme-standard td, .fc-theme-standard th {
                                border-color: ${token.colorBorderSecondary} !important;
                            }
                            /* Header background to match theme */
                            .fc-scrollgrid-section-header > td {
                                background-color: ${token.colorBgContainer} !important;
                            }
                            /* Navigation icons (arrows) */
                            .fc-icon {
                                color: ${token.colorText} !important;
                            }
                            /* Toolbar title */
                            .fc-toolbar-title {
                                color: ${token.colorText} !important;
                            }
                            /* More link for overflow events */
                            .fc-more-link {
                                color: ${token.colorPrimary} !important;
                            }
                            /* Popover for overflow events */
                            .fc-popover {
                                background-color: ${token.colorBgElevated} !important;
                                border-color: ${token.colorBorder} !important;
                            }
                            .fc-popover-header {
                                background-color: ${token.colorBgElevated} !important;
                                color: ${token.colorText} !important;
                            }
                            .fc-popover-body {
                                background-color: ${token.colorBgElevated} !important;
                            }
                            .fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link {
                                box-shadow: none !important;
                            }
                            .fc-direction-ltr .fc-timegrid-col-events {
                                margin: 0 !important;
                            }
                            .fc-timegrid-axis, .fc-scrollgrid-sync-inner {
                                background-color: ${token.colorBgElevated} !important;
                            }
                            .fc-theme-standard .fc-scrollgrid {
                                border-color: ${token.colorBorderSecondary} !important;
                            }
                            .fc-daygrid-day-number {
                                color: ${token.colorText} !important;
                                cursor: default !important;
                                &:hover {
                                    color: ${token.colorPrimary} !important;
                                }
                            }
                            .fc-today-button.fc-button.fc-button-primary,
                            .fc-prev-button.fc-button.fc-button-primary,
                            .fc-next-button.fc-button.fc-button-primary {
                                background-color: ${token.colorBgBase} !important;
                                color: ${token.colorText} !important;
                                border-color: ${token.colorBorder} !important;
                                outline: none !important;
                                box-shadow: none !important;
                                &:hover {
                                    background-color: ${token.colorBgContainer} !important;
                                }
                                &:focus, &:active {
                                    background-color: ${token.colorBgContainer} !important;
                                    border-color: ${token.colorBorder} !important;
                                    box-shadow: none !important;
                                    outline: none !important;
                                }
                            }
                            
                            .fc-dayGridMonth-button.fc-button.fc-button-primary.fc-button-active {
                                background-color: ${token.colorBgContainer} !important;
                                color: ${token.colorText} !important;
                                border-color: ${token.colorBorder} !important;
                                outline: none !important;
                                box-shadow: none !important;
                                &:hover {
                                    background-color: ${token.colorBgContainer} !important;
                                }
                                &:focus {
                                    box-shadow: none !important;
                                }
                            }
                            `}
                        </style>
                    </Card>
                </Col>

                {/* Right Column: Plan Info & History */}
                <Col xs={24} lg={8}>
                    <Row gutter={[0, 24]}>
                        <Col span={24}>
                            <Card
                                title="Plan Actual"
                                extra={
                                    activePlan ? (
                                        activePlan.status === "active" ? (
                                            <Tag color="green">Activo</Tag>
                                        ) : (
                                            <Tag color="red">Inactivo</Tag>
                                        )
                                    ) : (
                                        <Tag color="red">Inactivo</Tag>
                                    )
                                }
                                actions={[
                                    activePlan && activePlan.status === "active" ? (
                                        <Button
                                            danger
                                            type="default"
                                            icon={<PauseCircleOutlined />}
                                            className="align-self-end"
                                            onClick={() => setIsPauseModalOpen(true)}
                                        >
                                            Pausar Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            icon={<CreditCardOutlined />}
                                            className="align-self-end"
                                            onClick={() => openModal()}
                                            disabled={false} // Always enabled if not active
                                        >
                                            Renovar Plan
                                        </Button>
                                    ),
                                ]}
                            >
                                {activePlan ? (
                                    <>
                                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                                            <Title level={4} style={{ margin: 0 }}>
                                                {activePlan.name || "Plan Desconocido"}
                                            </Title>
                                            <Typography.Text>
                                                Tipo: {activePlan.type || "Tipo Desconocido"}. <br />
                                                Inicio:{" "}
                                                {dayjs(activePlan.start_date).format("DD MMM YYYY")} -
                                                Vence:{" "}
                                                {dayjs(activePlan.end_date).format("DD MMM YYYY")}
                                            </Typography.Text>
                                        </div>
                                        <Row gutter={16}>
                                            <Col span={12} style={{ textAlign: "center" }}>
                                                {activePlan.max_classes === 0 ? (
                                                    <Statistic
                                                        title="Clases Restantes"
                                                        value="Ilimitado"
                                                        prefix={<ClockCircleOutlined />}
                                                        style={{ fontSize: 16 }}
                                                    />
                                                ) : (
                                                    <Statistic
                                                        title="Clases Restantes"
                                                        value={`${activePlan.classes_remaining || 0}/${activePlan.max_classes || 0
                                                            }`}
                                                        prefix={<ClockCircleOutlined />}
                                                        style={{ fontSize: 16 }}
                                                    />
                                                )}
                                            </Col>
                                            <Col span={12} style={{ textAlign: "center" }}>
                                                <Statistic
                                                    title="Próximo Pago"
                                                    value={activePlan.price || 0}
                                                    prefix="$"
                                                    style={{ fontSize: 16 }}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                ) : (
                                    <div style={{ textAlign: "center", padding: 20 }}>
                                        <Text type="secondary">
                                            No hay un plan activo actualmente.
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Detalles" variant={false} style={{ padding: 0 }}>
                                <Tabs defaultActiveKey="1" items={items} />
                            </Card>
                        </Col>
                    </Row>
                </Col >
            </Row >
            <Modal
                open={modalVisible}
                title={null}
                footer={null}
                width={800}
                onCancel={() => closeModal(false)}
                destroyOnHidden
            >
                {moduleData ? (
                    moduleData.blocks?.length > 0 ? (
                        <>
                            <FormHeader
                                title="Crear Pago"
                                subtitle="Registra un nuevo pago para renovar el plan."
                                onSave={() => form.submit()}
                                onCancel={() => closeModal(false)}
                            />
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleFormSubmit}
                                style={{ padding: "0 10px" }}
                            >
                                {moduleData.blocks.map((block) => (
                                    <FormSection
                                        key={block.block_id}
                                        title={block.block_name}
                                        fields={block.fields}
                                    />
                                ))}
                                <FormFooter
                                    onCancel={() => closeModal(false)}
                                    onSave={() => form.submit()}
                                />
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: 50 }}>
                            No hay campos para mostrar.
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: "center", padding: 50 }}>
                        <Spin /> <p>Cargando campos...</p>
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: token.colorError }} />
                        <span>Pausar Plan</span>
                    </Space>
                }
                open={isPauseModalOpen}
                onOk={handlePausePlan}
                onCancel={() => setIsPauseModalOpen(false)}
                okText="Pausar Plan"
                okButtonProps={{ danger: true }}
                cancelText="Cancelar"
            >
                <div style={{ marginBottom: 16 }}>
                    <Typography.Paragraph>
                        Al pausar este plan, se suspenderá el acceso del estudiante y se detendrá el ciclo de facturación o vigencia actual.
                        Es necesario que ingreses una nota justificando esta acción.
                    </Typography.Paragraph>
                </div>
                <div>
                    <Typography.Text strong>Motivo de la pausa:</Typography.Text>
                    <Input.TextArea
                        rows={4}
                        placeholder="Ej: El estudiante solicitó congelar su plan por viaje..."
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default StudentHistory;
