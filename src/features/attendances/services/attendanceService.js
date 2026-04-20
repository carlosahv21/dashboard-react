import api from "../../../api/axiosInstance";

/**
 * Service for attendance-related API calls.
 */
const attendanceService = {
  /**
   * Fetches classes for a specific day with pagination.
   */
  getClasses: (day, page, limit) =>
    api.get(
      `classes?date=${day}&page=${page}&limit=${limit}&order_by=hour&order_direction=asc`
    ),

  /**
   * Fetches registrations (students) for a class with pagination and search.
   */
  getRegistrations: (classId, page, limit, search = "") => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return api.get(
      `registrations?class_id=${classId}&page=${page}&limit=${limit}${searchParam}&payment_date=this_month&order_by=u.first_name&order_direction=asc`
    );
  },

  /**
   * Fetches attendance records for a class on a specific date.
   */
  getAttendance: (classId, date, limit = 1000) =>
    api.get(`attendances?class_id=${classId}&date=${date}&limit=${limit}`),

  /**
   * Saves attendance records.
   * @param {Array} attendanceData
   */
  saveAttendance: (attendanceData) => api.post("attendances", attendanceData),

  /**
   * Fetches all students registered in a class (no pagination, for saving all).
   */
  getAllRegistrations: (params) => api.get("registrations", { params }),
};

export default attendanceService;
