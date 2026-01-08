import React, { useContext } from "react";
import {
    UserOutlined,
    BookOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import {
    Card,
    Row,
    Col,
    Statistic,
    Spin,
    Select,
    Table,
    Empty,
    List,
    Avatar,
    Typography,
    Divider,
} from "antd";
import ReactECharts from "echarts-for-react";
import { AuthContext } from "../../context/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";

const DashboardView = () => {
    const { settings } = useContext(AuthContext);

    const {
        kpiLoading,
        userDistributionLoading,
        classOccupancyLoading,
        kpiData,
        charts,
        onOccupancyChartReady,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
        teachersParticipationLoading,
        teachersParticipationData,
        teachersParticipationColumns,
        retentionChurnLoading,
        revenueLoading,
        engagementLoading,
        efficiencyLoading,
        auditLoading,
        usersAtRisk,
        isSuspicious,
        auditData,
    } = useDashboardData();

    const occupancyOption = charts.occupancyDrilldown;

    // --- Configuración de la vista ---
    const isDarkMode = settings?.theme === "dark";
    const chartTheme = isDarkMode ? "dark" : "light";

    return (
        <>
            {/* KPIs Row */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: "4px solid #0A84FF",
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title="Active Students"
                                value={kpiData.activeStudents}
                                suffix={
                                    <UserOutlined style={{ marginLeft: 8, color: "#0A84FF" }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: "4px solid #0A84FF",
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title="Today's Classes"
                                value={kpiData.todayClasses}
                                suffix={
                                    <BookOutlined style={{ marginLeft: 8, color: "#0A84FF" }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: "4px solid #0A84FF",
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title="Monthly Revenue"
                                value={kpiData.monthlyRevenue}
                                precision={2}
                                suffix={
                                    <DollarOutlined style={{ marginLeft: 8, color: "#0A84FF" }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: "4px solid #0A84FF",
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title="Attendance Rate"
                                value={kpiData.attendanceRate}
                                precision={1}
                                suffix={
                                    <CheckCircleOutlined
                                        style={{ marginLeft: 8, color: "#0A84FF" }}
                                    />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        hoverable
                        title="Tasa de Ocupación por Clase"
                        extra={
                            <Select
                                value={selectedGenre}
                                onChange={setSelectedGenre}
                                style={{ width: 200 }}
                                placeholder="Selecciona un género"
                                options={availableGenres.map((genre) => ({
                                    label: genre,
                                    value: genre,
                                }))}
                            />
                        }
                    >
                        <Spin spinning={classOccupancyLoading}>
                            <div style={{ height: "400px", width: "100%" }}>
                                {occupancyOption ? (
                                    <ReactECharts
                                        option={occupancyOption}
                                        onChartReady={onOccupancyChartReady}
                                        theme={chartTheme}
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <p>Cargando datos del reporte...</p>
                                    </div>
                                )}
                            </div>
                        </Spin>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Auditoría</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    {/* User Distribution */}
                    <Card hoverable title="Distribución de Usuarios por Plan">
                        <div style={{ height: "400px", width: "100%" }}>
                            {userDistributionLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.userDistribution}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Teachers Table - Half Width (Right) */}
                <Col span={12}>
                    <Card
                        title="Teachers Performance"
                        hoverable
                        style={{ minHeight: "505px" }}
                    >
                        <Spin spinning={teachersParticipationLoading}>
                            <Table
                                columns={teachersParticipationColumns}
                                dataSource={teachersParticipationData}
                                pagination={false}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Retention & Churn</Divider>
            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card hoverable title="Análisis de Cohortes (Retención %)">
                        <div style={{ height: "450px", width: "100%" }}>
                            {retentionChurnLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : charts.retentionHeatmap ? (
                                <ReactECharts
                                    option={charts.retentionHeatmap}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <p>No hay datos de cohortes suficientes.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable title="Churn Rate (Tasa de Abandono)">
                        <div
                            style={{
                                height: "450px",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            {retentionChurnLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <ReactECharts
                                        option={charts.churnGauge}
                                        theme={chartTheme}
                                        style={{ height: "300px", width: "100%" }}
                                    />
                                    <div style={{ textAlign: "center", marginTop: -40 }}>
                                        <p style={{ color: "#999" }}>Último mes analizado</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Revenue Optimization</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card hoverable title="Análisis por Método de Pago">
                        <div style={{ height: "400px", width: "100%" }}>
                            {revenueLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.revenueDonut}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card hoverable title="Transacciones vs Promedio">
                        <div style={{ height: "400px", width: "100%" }}>
                            {revenueLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.revenueComparison}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Student Engagement</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={16}>
                    <Card hoverable title="Utilización de Clases (Scatter Analysis)">
                        <div style={{ height: "450px", width: "100%" }}>
                            {engagementLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.engagementScatter}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        hoverable
                        title="Usuarios en Riesgo"
                        style={{ minHeight: "555px", overflowY: "auto" }}
                    >
                        <Spin spinning={engagementLoading}>
                            <List
                                dataSource={usersAtRisk}
                                renderItem={(user) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={<UserOutlined />}
                                                    style={{
                                                        backgroundColor: "rgba(10, 132, 255, 0.2)",
                                                        color: "#0A84FF",
                                                    }}
                                                />
                                            }
                                            title={`${user.first_name} ${user.last_name}`}
                                            description={
                                                <>
                                                    {user.email} <br />
                                                    <Typography.Text type="danger">
                                                        {user.last_attendance === null
                                                            ? "Sin asistencia registrada"
                                                            : `Última asis: ${user.last_attendance}`}
                                                    </Typography.Text>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Operational Efficiency</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={14}>
                    <Card hoverable title="Tasa de Llenado por Clase (%)">
                        <div style={{ height: "500px", width: "100%" }}>
                            {efficiencyLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.efficiencyFillRate}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card hoverable title="Eficiencia de Profesores (Radar)">
                        <div style={{ height: "500px", width: "100%" }}>
                            {efficiencyLoading ? (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts
                                    option={charts.efficiencyRadar}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Admin Audit & Control</Divider>
            <Card hoverable style={{ textAlign: "center", padding: "40px 0" }}>
                {auditLoading ? (
                    <Spin size="large" />
                ) : !isSuspicious ? (
                    <Empty
                        image={
                            <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
                        }
                        description={
                            <Typography.Title level={4} style={{ color: "#52c41a" }}>
                                Sin actividad sospechosa detectada
                            </Typography.Title>
                        }
                    >
                        <Typography.Text type="secondary">
                            El sistema de auditoría no ha detectado cambios manuales ni
                            cancelaciones sospechosas en el último periodo.
                        </Typography.Text>
                    </Empty>
                ) : (
                    <Empty
                        image={
                            <WarningOutlined style={{ fontSize: 64, color: "#faad14" }} />
                        }
                        description={
                            <Typography.Title level={4} style={{ color: "#faad14" }}>
                                Se requiere revisión administrativa
                            </Typography.Title>
                        }
                    />
                )}
            </Card>
        </>
    );
};

export default DashboardView;
