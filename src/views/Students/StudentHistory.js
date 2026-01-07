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
} from "antd";
import {
  LeftOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import useFetch from "../../hooks/useFetch";

const { Title, Text } = Typography;

const StudentHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useFetch();
  const { token } = theme.useToken();

  const [student, setStudent] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Student Data
        const response = await request(`students/${id}`);
        setStudent(response.data);

        // Fetch Plan Data
        const planResponse = await request(`plans/student/${id}`);
        setActivePlan(planResponse.data);

        // Fetch Attendance
        const attResponse = await request(`attendance?student_id=${id}`);
        setAttendances(attResponse.data || []);

        // Fetch Payments
        const payResponse = await request(`payments?user_id=${id}`);
        setPayments(payResponse.data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, request]);

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
                  <Button
                    type="default"
                    icon={<CreditCardOutlined />}
                    className="align-self-end"
                  >
                    Renovar Plan
                  </Button>,
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
                            value={`${activePlan.classes_remaining || 0}/${
                              activePlan.max_classes || 0
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
        </Col>
      </Row>
    </>
  );
};

export default StudentHistory;
