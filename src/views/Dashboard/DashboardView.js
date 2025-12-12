import React, { useContext } from "react";
import { Card, Row, Col, DatePicker, Statistic, Spin, Select } from "antd";
import { UserOutlined, BookOutlined, DollarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import ReactECharts from 'echarts-for-react';
import { AuthContext } from "../../context/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";

const { RangePicker } = DatePicker;

const DashboardView = () => {
    const { settings } = useContext(AuthContext);

    const {
        loading,
        kpiData,
        charts,
        onOccupancyChartReady,
        availableGenres,
        selectedGenre,
        setSelectedGenre
    } = useDashboardData();

    const occupancyOption = charts.occupancyDrilldown;

    // --- Configuración de la vista ---
    const isDarkMode = settings?.theme === 'dark';
    const chartTheme = isDarkMode ? 'dark' : 'light';

    // KPI Card Style Helper
    const kpiCardStyle = {
        borderRadius: '10px',
        color: '#fff',
        border: 'none',
        overflow: 'hidden'
    };

    return (
        <>
            {loading ? (
                <Spin size="large" />
            ) : (
                <div style={{ padding: 24 }}>
                    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={6}>
                            <Card
                                style={{ ...kpiCardStyle, background: 'linear-gradient(135deg, #FFC53D 0%, #FF9c6e 100%)' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#fff' }}>Active Students</span>}
                                    value={kpiData.activeStudents}
                                    suffix={<UserOutlined style={{ marginLeft: 8 }} />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Card
                                style={{ ...kpiCardStyle, background: 'linear-gradient(135deg, #722ED1 0%, #B37FEB 100%)' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#fff' }}>Today's Classes</span>}
                                    value={kpiData.todayClasses}
                                    suffix={<BookOutlined style={{ marginLeft: 8 }} />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Card
                                style={{ ...kpiCardStyle, background: 'linear-gradient(135deg, #EB2F96 0%, #F759AB 100%)' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#fff' }}>Monthly Revenue</span>}
                                    value={kpiData.monthlyRevenue}
                                    precision={2}
                                    suffix={<DollarOutlined style={{ marginLeft: 8 }} />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Card
                                style={{ ...kpiCardStyle, background: 'linear-gradient(135deg, #87dd93 0%, #3dbd48 100%)' }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#fff' }}>Attendance Rate</span>}
                                    value={kpiData.attendanceRate}
                                    precision={1}
                                    suffix={<CheckCircleOutlined style={{ marginLeft: 8 }} />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Charts Row */}
                    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                            <Card
                                hoverable
                                extra={
                                    <Select
                                        value={selectedGenre}
                                        onChange={setSelectedGenre}
                                        style={{ width: 200 }}
                                        placeholder="Selecciona un género"
                                        options={availableGenres.map(genre => ({
                                            label: genre,
                                            value: genre
                                        }))}
                                    />
                                }
                            >
                                <Spin spinning={loading}>
                                    {occupancyOption ? (
                                        <ReactECharts
                                            option={occupancyOption}
                                            onChartReady={onOccupancyChartReady}
                                            theme={chartTheme}
                                            style={{ height: '400px' }}
                                        />
                                    ) : (
                                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <p>Cargando datos del reporte...</p>
                                        </div>
                                    )}
                                </Spin>
                            </Card>
                        </Col>
                    </Row>

                    {/* Bottom Row: User Distribution, Revenue, Teachers Table */}
                    <Row gutter={[24, 24]}>
                        <Col span={12}>
                            {/* User Distribution */}
                            <Card hoverable extra={<RangePicker />} style={{ marginBottom: 24 }}>
                                <ReactECharts option={charts.userDistribution} theme={chartTheme} style={{ height: '400px', width: '100%' }} />
                            </Card>
                        </Col>

                        {/* Teachers Table - Half Width (Right) */}
                        <Col span={12}>
                            <Card title="Teachers Performance" hoverable style={{ minHeight: '835px' }}>

                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </>
    );
};

export default DashboardView;