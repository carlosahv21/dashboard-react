import React, { useContext } from "react";
import { Row, Col, Divider, theme } from "antd";
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
                    />
                </Col>
                <Col span={12}>
                    <TeacherParticipationCard
                        loading={teachersParticipationLoading}
                        columns={teachersParticipationColumns}
                        data={teachersParticipationData}
                        t={t}
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
            />

            {/* 5. Revenue Section */}
            <RevenueAnalysisSection
                loading={revenueLoading}
                donutOption={charts.revenueDonut}
                barComparisonOption={charts.revenueComparison}
                theme={chartTheme}
                t={t}
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
            />

            {/* 7. Efficiency Section */}
            <EfficiencySection
                loading={efficiencyLoading}
                fillRateOption={charts.efficiencyFillRate}
                teacherRadarOption={charts.efficiencyRadar}
                theme={chartTheme}
                t={t}
            />

            {/* 8. Audit Section */}
            <AuditLogCard loading={auditLoading} isSuspicious={isSuspicious} t={t} />
        </>
    );
};

export default DashboardPage;
