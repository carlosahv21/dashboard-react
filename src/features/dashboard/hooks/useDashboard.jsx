import useKpis from "./useKpis";
import useUserDistribution from "./useUserDistribution";
import useClassOccupancy from "./useClassOccupancy";
import useTeachersParticipation from "./useTeachersParticipation";
import useRetentionChurn from "./useRetentionChurn";
import useRevenue from "./useRevenue";
import useEngagement from "./useEngagement";
import useEfficiency from "./useEfficiency";
import useAudit from "./useAudit";

/**
 * Orchestrator hook for all dashboard data.
 * @param {Object} settings - User/System settings (for formatting).
 */
const useDashboard = (settings) => {
  const { kpiLoading, kpiData } = useKpis();
  const { userDistributionLoading, userDistributionOption } = useUserDistribution();
  const {
    classOccupancyLoading,
    availableGenres,
    selectedGenre,
    setSelectedGenre,
    occupancyDrilldownOption,
    onOccupancyChartReady,
  } = useClassOccupancy();
  const {
    teachersParticipationLoading,
    teachersParticipationData,
    teachersParticipationColumns,
  } = useTeachersParticipation();
  const { retentionChurnLoading, heatmapOption, churnGaugeOption } = useRetentionChurn();
  const { revenueLoading, donutOption, barComparisonOption } = useRevenue(settings);
  const { engagementLoading, scatterOption, usersAtRisk } = useEngagement();
  const { efficiencyLoading, fillRateOption, teacherRadarOption } = useEfficiency();
  const { auditLoading, isSuspicious, auditData } = useAudit();

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

export default useDashboard;
