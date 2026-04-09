import api from "../../../api/axiosInstance";

/**
 * Service for notification-related API calls.
 */
const notificationService = {
  /**
   * Fetches the dashboard sidebar data summary.
   */
  getSidebarSummary: () => api.get("reports/dashboard-sidebar"),

  /**
   * Fetches all notifications for the current user.
   */
  getNotifications: () => api.get("notifications"),

  /**
   * Marks a single notification as read.
   * @param {string} id
   */
  markAsRead: (id) => api.patch(`notifications/${id}/read`),

  /**
   * Marks all notifications as read.
   */
  markAllAsRead: () => api.patch("notifications/read-all"),

  /**
   * Deletes a notification.
   * @param {string} id
   */
  deleteNotification: (id) => api.delete(`notifications/${id}`),
};

export default notificationService;
