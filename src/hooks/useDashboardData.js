import useFetch from "./useFetch";

import useKpisData from "../reports/useKpisData";
import { useUserDistributionReport } from "../reports/useUserDistributionReport";
import { useClassOccupancyReport } from "../reports/useClassOccupancyReport";
import { useTeachersParticipation } from "../reports/useTeachersParticipation";
import { useRetentionChurnReport } from "../reports/useRetentionChurnReport";
import { useRevenueReport } from "../reports/useRevenueReport";
import { useEngagementReport } from "../reports/useEngagementReport";
import { useEfficiencyReport } from "../reports/useEfficiencyReport";
import { useAuditReport } from "../reports/useAuditReport";

export const useDashboardData = (settings) => {
    const { request } = useFetch();

    const {
        kpiLoading,
        kpiData,
    } = useKpisData(request);

    const {
        userDistributionLoading,
        userDistributionOption,
    } = useUserDistributionReport(request);

    const {
        classOccupancyLoading,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
        occupancyDrilldownOption,
        onOccupancyChartReady,
    } = useClassOccupancyReport(request);

    const {
        teachersParticipationLoading,
        teachersParticipationData,
        teachersParticipationColumns,
    } = useTeachersParticipation(request);

    const { retentionChurnLoading, heatmapOption, churnGaugeOption } =
        useRetentionChurnReport(request);

    const {
        revenueLoading,
        donutOption,
        barComparisonOption
    } = useRevenueReport(request, settings);

    const {
        engagementLoading,
        scatterOption,
        usersAtRisk
    } = useEngagementReport(request);

    const {
        efficiencyLoading,
        fillRateOption,
        teacherRadarOption
    } = useEfficiencyReport(request);

    const {
        auditLoading,
        isSuspicious,
        auditData,
    } = useAuditReport(request);

    const overallLoading =
        kpiLoading ||
        userDistributionLoading ||
        classOccupancyLoading ||
        retentionChurnLoading ||
        revenueLoading ||
        engagementLoading ||
        efficiencyLoading ||
        auditLoading;

    return {
        loading: overallLoading,
        kpiLoading,
        userDistributionLoading,
        classOccupancyLoading,
        retentionChurnLoading,
        revenueLoading,
        engagementLoading,
        efficiencyLoading,
        auditLoading,
        kpiData,
        charts: {
            userDistribution: userDistributionOption,
            occupancyDrilldown: occupancyDrilldownOption,
            retentionHeatmap: heatmapOption,
            churnGauge: churnGaugeOption,
            revenueDonut: donutOption,
            revenueComparison: barComparisonOption,
            engagementScatter: scatterOption,
            efficiencyFillRate: fillRateOption,
            efficiencyRadar: teacherRadarOption,
        },
        usersAtRisk,
        isSuspicious,
        auditData,
        onOccupancyChartReady,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
        teachersParticipationLoading,
        teachersParticipationData,
        teachersParticipationColumns,
    };
};
