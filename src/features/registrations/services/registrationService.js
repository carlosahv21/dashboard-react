import api from "../../../api/axiosInstance";

/**
 * Service for registration-related API calls.
 */
const registrationService = {
  /**
   * Fetches students by search term.
   */
  getStudents: (searchTerm) =>
    api.get(
      `students?role=student&limit=50&search=${searchTerm}&order_by=first_name&order_direction=asc`
    ),

  /**
   * Fetches classes by search term.
   */
  getClasses: (searchTerm) =>
    api.get(
      `classes?limit=50&search=${searchTerm}&order_by=name&order_direction=asc`
    ),

  /**
   * Fetches favorite classes (initial list).
   */
  getFavoriteClasses: () =>
    api.get("classes?is_favorites=true&order_by=name&order_direction=asc"),

  /**
   * Fetches enrollments for a specific student.
   */
  getEnrollments: (studentId) =>
    api.get(`registrations?user_id=${studentId}`),

  /**
   * Enrolls a student in a class.
   */
  enroll: (studentId, classId) =>
    api.post("registrations", { user_id: studentId, class_id: classId }),

  /**
   * Unenrolls a student from a class.
   */
  unenroll: (registrationId) => api.delete(`registrations/${registrationId}`),
};

export default registrationService;
