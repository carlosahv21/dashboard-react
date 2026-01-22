import React, { useContext } from "react";
import {
    UserOutlined,
    BookOutlined,
    DollarOutlined,
    CheckCircleOutlined,
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
    theme,
} from "antd";
import ReactECharts from "echarts-for-react";
import { AuthContext } from "../../context/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useTranslation } from "react-i18next";

const DashboardView = () => {
    const { settings } = useContext(AuthContext);
    const { token } = theme.useToken();
    const { t } = useTranslation();

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
                            borderLeft: `4px solid ${token.colorPrimary}`,
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title={t("dashboard.activeStudents")}
                                value={kpiData.activeStudents}
                                suffix={
                                    <UserOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: `4px solid ${token.colorPrimary}`,
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title={t("dashboard.todayClasses")}
                                value={kpiData.todayClasses}
                                suffix={
                                    <BookOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: `4px solid ${token.colorPrimary}`,
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title={t("dashboard.monthlyRevenue")}
                                value={kpiData.monthlyRevenue}
                                precision={2}
                                suffix={
                                    <DollarOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
                                }
                            />
                        </Spin>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card
                        style={{
                            borderLeft: `4px solid ${token.colorPrimary}`,
                        }}
                    >
                        <Spin spinning={kpiLoading}>
                            <Statistic
                                title={t("dashboard.attendanceRate")}
                                value={kpiData.attendanceRate}
                                precision={1}
                                suffix={
                                    <CheckCircleOutlined
                                        style={{ marginLeft: 8, color: token.colorPrimary }}
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
                        title={t("stats.occupancyByClass")}
                        extra={
                            <Select
                                value={selectedGenre}
                                onChange={setSelectedGenre}
                                style={{ width: 200 }}
                                placeholder={t("stats.selectGenre")}
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
                                        <p>{t("global.noData")}</p>
                                    </div>
                                )}
                            </div>
                        </Spin>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">{t("divider.auditLog")}</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    {/* User Distribution */}
                    <Card hoverable title={t("stats.userDistributionByPlan")}>
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
                            ) : charts.userDistribution ? (
                                <ReactECharts
                                    option={charts.userDistribution}
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
                                    <Empty description={t("global.noData")} />
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Teachers Table - Half Width (Right) */}
                <Col span={12}>
                    <Card
                        title={t("stats.teachersParticipation")}
                        hoverable
                        style={{ minHeight: "505px", maxHeight: "505px", overflowY: "auto" }}
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

            <Divider orientation="left">{t("divider.retentionChurn")}</Divider>
            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card hoverable title={t("stats.retentionChurn")}>
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
                                    <p>{t("global.noData")}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable title={t("stats.churnRate")}>
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
                                    {charts.churnGauge ? (
                                        <ReactECharts
                                            option={charts.churnGauge}
                                            theme={chartTheme}
                                            style={{ height: "300px", width: "100%" }}
                                        />
                                    ) : (
                                        <Empty description={t('stats.noChurnData')} />
                                    )}
                                    <div style={{ textAlign: "center", marginTop: -40 }}>
                                        <p style={{ color: "#999" }}>{t("stats.lastMonthAnalyzed")}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">{t("divider.revenueOptimization")}</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card hoverable title={t('stats.paymentMethodAnalysis')}>
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
                            ) : charts.revenueDonut ? (
                                <ReactECharts
                                    option={charts.revenueDonut}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <Empty description={t("global.noData")} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card hoverable title={t("stats.transactionsVsAverage")}>
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
                            ) : charts.revenueComparison ? (
                                <ReactECharts
                                    option={charts.revenueComparison}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <Empty description={t("global.noData")} />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">{t("divider.studentEngagement")}</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={16}>
                    <Card hoverable title={t("stats.utilizationByClass")}>
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
                            ) : charts.engagementScatter ? (
                                <ReactECharts
                                    option={charts.engagementScatter}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <Empty description={t("global.noData")} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        hoverable
                        title={t("stats.usersAtRisk")}
                        style={{ minHeight: "555px", maxHeight: "555px", overflowY: "auto" }}
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
                                                        color: token.colorPrimary,
                                                    }}
                                                />
                                            }
                                            title={`${user.first_name} ${user.last_name}`}
                                            description={
                                                <>
                                                    {user.email} <br />
                                                    <Typography.Text type="danger">
                                                        {user.last_attendance === null
                                                            ? t("stats.noAttendanceData")
                                                            : t("stats.lastAttendance") + " " + user.last_attendance}
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

            <Divider orientation="left">{t("divider.operationalEfficiency")}</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={14}>
                    <Card hoverable title={t("stats.occupancyClass")}>
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
                            ) : charts.efficiencyFillRate ? (
                                <ReactECharts
                                    option={charts.efficiencyFillRate}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <Empty description={t("global.noData")} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card hoverable title={t("stats.teachersEfficiency")}>
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
                            ) : charts.efficiencyRadar ? (
                                <ReactECharts
                                    option={charts.efficiencyRadar}
                                    theme={chartTheme}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            ) : (
                                <Empty description={t("global.noData")} />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">{t("divider.adminAuditControl")}</Divider>
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
                                {t("stats.noSuspiciousActivity")}
                            </Typography.Title>
                        }
                    >
                        <Typography.Text type="secondary">
                            {t("stats.noSuspiciousActivityDescription")}
                        </Typography.Text>
                    </Empty>
                ) : (
                    <Empty
                        image={
                            <WarningOutlined style={{ fontSize: 64, color: "#faad14" }} />
                        }
                        description={
                            <Typography.Title level={4} style={{ color: "#faad14" }}>
                                {t("stats.suspiciousActivity")}
                            </Typography.Title>
                        }
                    />
                )}
            </Card>
        </>
    );
};

export default DashboardView;
