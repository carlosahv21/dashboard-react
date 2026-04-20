import api from "../../../api/axiosInstance";

/**
 * Service for handling all dashboard reporting API calls.
 */
const dashboardService = {
  /**
   * Fetches main KPIs for the dashboard.
   */
  getKpis: (params) => api.get("reports/kpi", { params }),

  /**
   * Fetches user distribution by plan.
   */
  getUserDistribution: (params) => api.get("reports/user-distribution", { params }),

  /**
   * Fetches class occupancy rates and drilldown data.
   */
  getClassOccupancy: (params) => api.get("reports/class-occupancy", { params }),

  /**
   * Fetches teacher participation and performance metrics.
   */
  getTeachersParticipation: (params) => api.get("reports/teachers-participation", { params }),

  /**
   * Fetches retention and churn report data.
   */
  getRetentionChurn: (params) => api.get("reports/retention-churn", { params }),

  /**
   * Fetches revenue optimization data (payment methods, averages).
   */
  getRevenue: (params) => api.get("reports/revenue-optimization", { params }),

  /**
   * Fetches student engagement metrics (scatter plot, users at risk).
   */
  getEngagement: (params) => api.get("reports/student-engagement", { params }),

  /**
   * Fetches operational efficiency metrics (fill rate, radar).
   */
  getEfficiency: (params) => api.get("reports/operational-efficiency", { params }),

  /**
   * Fetches administrative audit and suspicious activity log.
   */
  getAuditLog: (params) => api.get("reports/admin-audit", { params }),
};

export default dashboardService;
