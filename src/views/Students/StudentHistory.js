import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Calendar, Tabs, Button, Tag, Typography, Table, Badge, Statistic } from 'antd';
import { LeftOutlined, ClockCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useFetch from '../../hooks/useFetch';

const { Title, Text } = Typography;

const StudentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { request, loading } = useFetch();

    const [student, setStudent] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activePlan, setActivePlan] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Student Data
                const studentData = await request(`students/${id}`);
                setStudent(studentData);

                // Fetch Plan Data
                const planData = await request(`plans/student/${id}`);
                setActivePlan(planData);

                // Fetch Attendance
                // Use a query parameter for filtering by student
                const attData = await request(`attendance?student_id=${id}`);
                setAttendances(attData.data || []);

                // Fetch Payments (placeholder for now as strict endpoint distinctness is unverified, but ready to use)
                const payData = await request(`payments?user_id=${id}`);
                setPayments(payData.data || []);

            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, request]);

    const dateCellRender = (value) => {
        const dateString = value.format('YYYY-MM-DD');
        const dayAttendance = attendances.find(a => dayjs(a.date).format('YYYY-MM-DD') === dateString);
        if (dayAttendance) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                    {dayAttendance.status === 'present' ? (
                        <Badge status="success" text="Presente" />
                    ) : (
                        <Badge status="error" text="Ausente" />
                    )}
                </div>
            );
        }

        return null;
    };

    const attendanceColumns = [
        { title: 'Fecha', dataIndex: 'date', key: 'date', render: (d) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Clase', dataIndex: 'class_name', key: 'class_name' },
        { title: 'Estado', dataIndex: 'status', key: 'status', render: (status) => status === 'present' ? <Tag color="green">Presente</Tag> : <Tag color="red">Ausente</Tag> },
    ];

    const paymentColumns = [
        { title: 'Fecha', dataIndex: 'payment_date', key: 'payment_date', render: (d) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Método', dataIndex: 'payment_method', key: 'payment_method' },
        { title: 'Monto', dataIndex: 'amount', key: 'amount', render: (amount) => `$${amount}` },
        { title: 'Estado', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'completed' ? 'green' : 'orange'}>{status}</Tag> },
    ];

    const items = [
        {
            key: '1',
            label: 'Historial de Pagos',
            children: <Table columns={paymentColumns} dataSource={payments} rowKey="id" size="small" pagination={{ pageSize: 5, placement: ['bottomCenter'] }} style={{ padding: 16 }} />,
        },
        {
            key: '2',
            label: 'Asistencias',
            children: <Table columns={attendanceColumns} dataSource={attendances} rowKey="id" size="small" pagination={{ pageSize: 5, placement: ['bottomCenter'] }} style={{ padding: 16 }} />,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => navigate('/students')}
                    style={{ marginRight: 16 }}
                >
                    Volver
                </Button>
                <Title level={3} style={{ margin: 0 }}>Historial de {student?.first_name} {student?.last_name}</Title>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column: Calendar */}
                <Col xs={24} lg={16}>
                    <Card title="Calendario de Actividades" variant={false}>
                        <Calendar
                            cellRender={dateCellRender}
                        />
                    </Card>
                </Col>

                {/* Right Column: Plan Info & History */}
                <Col xs={24} lg={8}>
                    <Row gutter={[0, 24]}>
                        <Col span={24}>
                            <Card
                                title="Plan Actual"
                                extra={ activePlan ? (activePlan.status === 'active' ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>) : <Tag color="red">Inactivo</Tag>}
                                actions={[
                                    <Button type="primary" icon={<CreditCardOutlined />} className='align-self-end'>Renovar Plan</Button>
                                ]}
                            >
                                {activePlan ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                            <Title level={4}>{activePlan.name || "Plan Desconocido"}</Title>
                                            <Typography.Text>
                                                Tipo: {activePlan.type || "Tipo Desconocido"}.  <br />
                                                Inicio: {dayjs(activePlan.start_date).format('DD MMM YYYY')} - Vence: {dayjs(activePlan.end_date).format('DD MMM YYYY')}
                                            </Typography.Text>
                                        </div>
                                        <Row gutter={16}>
                                            <Col span={12} style={{ textAlign: 'center' }}>
                                                {activePlan.max_classes == 0     ? (
                                                    <Statistic title="Clases Restantes" value="Ilimitado" prefix={<ClockCircleOutlined />} style={{ fontSize: 16 }} />
                                                ) : (
                                                    <Statistic title="Clases Restantes" value={`${activePlan.classes_remaining || 0}/${activePlan.max_classes || 0}`} prefix={<ClockCircleOutlined />} style={{ fontSize: 16 }} />
                                                )}
                                            </Col>
                                            <Col span={12} style={{ textAlign: 'center' }}>
                                                <Statistic title="Próximo Pago" value={activePlan.price || 0} prefix="$" style={{ fontSize: 16 }} />
                                            </Col>
                                        </Row>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 20 }}>
                                        <Text type="secondary">No hay un plan activo actualmente.</Text>
                                    </div>
                                )}
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Detalles" variant={false} style={{ padding: 0 }}>
                                <Tabs
                                    defaultActiveKey="1"
                                    items={items}
                                    tabBarStyle={{ padding: '0 16px' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default StudentHistory;
