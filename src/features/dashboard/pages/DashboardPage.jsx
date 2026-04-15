import React, { useContext } from "react";
import { Row, Col, Divider, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import useDashboard from "../hooks/useDashboard";
import { useTranslation } from "react-i18next";

// Componentes modulares
import KpiStats from "../components/KpiStats";
import OccupancyChart from "../components/OccupancyChart";
import UserDistributionCard from "../components/UserDistributionCard";
import TeacherParticipationCard from "../components/TeacherParticipationCard";
import RetentionChurnSection from "../components/RetentionChurnSection";
import RevenueAnalysisSection from "../components/RevenueAnalysisSection";
import EngagementSection from "../components/EngagementSection";
import EfficiencySection from "../components/EfficiencySection";
import AuditLogCard from "../components/AuditLogCard";

/**
 * Main Dashboard Page component.
 * Uses modular components to keep a clean structure.
 */
const DashboardPage = () => {
    const { settings } = useContext(AuthContext);
    const { token } = theme.useToken();
    const navigate = useNavigate();
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
    } = useDashboard(settings);

    // Helpers for navigation
    const handleNavigation = (path, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const fullPath = queryString ? `${path}?${queryString}` : path;
        navigate(fullPath);
    };

    const handleKpiClick = (type) => {
        switch (type) {
            case "activeStudents":
                handleNavigation("/students");
                break;
            case "todayClasses":
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const currentDay = days[new Date().getDay()];
                handleNavigation("/classes", { date: currentDay });
                break;
            case "monthlyRevenue":
                handleNavigation("/registrations/list", { date_range: "this_month" });
                break;
            case "attendanceRate":
                handleNavigation("/attendances/list", { date_range: "this_month" });
                break;
            default:
                break;
        }
    };

    // Theme configuration for ECharts
    const isDarkMode = settings?.theme === "dark";
    const chartTheme = isDarkMode ? "dark" : "light";

    return (
        <>
            {/* 1. KPIs Section */}
            <KpiStats
                kpiLoading={kpiLoading}
                kpiData={kpiData}
                t={t}
                token={token}
                settings={settings}
                onKpiClick={handleKpiClick}
            />

            {/* 2. Occupancy Drilldown Section */}
            <OccupancyChart
                loading={classOccupancyLoading}
                option={charts.occupancyDrilldown}
                onChartReady={onOccupancyChartReady}
                availableGenres={availableGenres}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
                t={t}
                theme={chartTheme}
            />

            {/* 3. Distribution & Teachers Section */}
            <Divider orientation="left">{t("divider.auditLog")}</Divider>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <UserDistributionCard
                        loading={userDistributionLoading}
                        option={charts.userDistribution}
                        theme={chartTheme}
                        t={t}
                        onClick={(planName) => handleNavigation("/students", planName ? { plan_name: planName, plan_status: 'active' } : {})}
                    />
                </Col>
                <Col span={12}>
                    <TeacherParticipationCard
                        loading={teachersParticipationLoading}
                        columns={teachersParticipationColumns}
                        data={teachersParticipationData}
                        t={t}
                        onClick={() => handleNavigation("/teachers")}
                    />
                </Col>
            </Row>

            {/* 4. Retention & Churn Section */}
            <RetentionChurnSection
                loading={retentionChurnLoading}
                heatmapOption={charts.retentionHeatmap}
                churnGaugeOption={charts.churnGauge}
                theme={chartTheme}
                t={t}
                onClick={() => handleNavigation("/students", { segment: "at_risk" })}
            />

            {/* 5. Revenue Section */}
            <RevenueAnalysisSection
                loading={revenueLoading}
                donutOption={charts.revenueDonut}
                barComparisonOption={charts.revenueComparison}
                theme={chartTheme}
                t={t}
                onClick={(paymentMethod) => handleNavigation("/registrations/list", paymentMethod ? { payment_method: paymentMethod } : {})}
            />

            {/* 6. Engagement Section */}
            <EngagementSection
                loading={engagementLoading}
                scatterOption={charts.engagementScatter}
                usersAtRisk={usersAtRisk}
                theme={chartTheme}
                token={token}
                settings={settings}
                t={t}
                onUserClick={(userId) => handleNavigation(`/students/${userId}/history`)}
            />

            {/* 7. Efficiency Section */}
            <EfficiencySection
                loading={efficiencyLoading}
                fillRateOption={charts.efficiencyFillRate}
                teacherRadarOption={charts.efficiencyRadar}
                theme={chartTheme}
                t={t}
                onClick={() => handleNavigation("/classes", { filter: "efficiency" })}
            />

            {/* 8. Audit Section */}
            <AuditLogCard 
                loading={auditLoading} 
                isSuspicious={isSuspicious} 
                t={t} 
                onClick={() => handleNavigation("/settings")}
            />
        </>
    );
};

export default DashboardPage;
