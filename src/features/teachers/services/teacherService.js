import api from "../../../api/axiosInstance";

/**
 * Service for teacher-related API calls.
 */
const teacherService = {
  /**
   * Fetches teacher details.
   * @param {string} teacherId
   */
  getTeacherDetails: (teacherId) => api.get(`teachers/details/${teacherId}`),

  /**
   * Updates teacher profile information.
   * @param {string} teacherId
   * @param {Object} data
   */
  updateTeacher: (teacherId, data) => api.put(`teachers/${teacherId}`, data),
};

export default teacherService;
