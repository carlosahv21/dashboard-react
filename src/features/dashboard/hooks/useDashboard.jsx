import { useState, useMemo } from "react";
import dayjs from "dayjs";
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
  // Global date range state
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  // Derived filters for API calls
  const filters = useMemo(() => ({
    start_date: dateRange[0].format("YYYY-MM-DD"),
    end_date: dateRange[1].format("YYYY-MM-DD"),
  }), [dateRange]);

  const { kpiLoading, kpiData } = useKpis(filters);
  const { userDistributionLoading, userDistributionOption } = useUserDistribution(filters);
  const {
    classOccupancyLoading,
    availableGenres,
    selectedGenre,
    setSelectedGenre,
    occupancyDrilldownOption,
    onOccupancyChartReady,
  } = useClassOccupancy(filters);


  const {
    teachersParticipationLoading,
    teachersParticipationData,
    teachersParticipationColumns,
  } = useTeachersParticipation(filters);
  const { retentionChurnLoading, heatmapOption, churnGaugeOption } = useRetentionChurn(filters);
  const { revenueLoading, donutOption, barComparisonOption } = useRevenue(settings, filters);
  const { engagementLoading, scatterOption, usersAtRisk } = useEngagement(filters);
  const { efficiencyLoading, fillRateOption, teacherRadarOption } = useEfficiency(filters);
  const { auditLoading, isSuspicious, auditData } = useAudit(filters);

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
    dateRange,
    setDateRange,
  };
};

export default useDashboard;
