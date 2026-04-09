import api from "../../../api/axiosInstance";

/**
 * Service for handling all dashboard reporting API calls.
 */
const dashboardService = {
  /**
   * Fetches main KPIs for the dashboard.
   */
  getKpis: () => api.get("reports/kpi"),

  /**
   * Fetches user distribution by plan.
   */
  getUserDistribution: () => api.get("reports/user-distribution"),

  /**
   * Fetches class occupancy rates and drilldown data.
   */
  getClassOccupancy: () => api.get("reports/class-occupancy"),

  /**
   * Fetches teacher participation and performance metrics.
   */
  getTeachersParticipation: () => api.get("reports/teachers-participation"),

  /**
   * Fetches retention and churn report data.
   */
  getRetentionChurn: () => api.get("reports/retention-churn"),

  /**
   * Fetches revenue optimization data (payment methods, averages).
   */
  getRevenue: () => api.get("reports/revenue-optimization"),

  /**
   * Fetches student engagement metrics (scatter plot, users at risk).
   */
  getEngagement: () => api.get("reports/student-engagement"),

  /**
   * Fetches operational efficiency metrics (fill rate, radar).
   */
  getEfficiency: () => api.get("reports/operational-efficiency"),

  /**
   * Fetches administrative audit and suspicious activity log.
   */
  getAuditLog: () => api.get("reports/admin-audit"),
};

export default dashboardService;
