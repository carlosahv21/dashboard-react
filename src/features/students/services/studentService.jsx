import api from "../../../api/axiosInstance";

/**
 * Specialized service for Student business logic in Cadencia.
 */
const studentService = {
  /**
   * Fetches the complete history for a student (Profile, Plan, Attendances, Payments).
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  getFullHistory: async (studentId) => {
    const [studentRes, planRes, attendancesRes, paymentsRes] = await Promise.all([
      api.get(`students/${studentId}`),
      api.get(`plans/student/${studentId}`),
      api.get(`attendances?student_id=${studentId}`),
      api.get(`payments?user_id=${studentId}`),
    ]);

    return {
      student: studentRes.data?.data || studentRes.data,
      activePlan: planRes.data?.data || planRes.data,
      attendances: attendancesRes.data?.data || attendancesRes.data || [],
      payments: paymentsRes.data?.data || paymentsRes.data || [],
    };
  },

  /**
   * Pauses an active plan.
   * @param {string} planId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  pausePlan: async (planId, reason) => {
    return await api.put(`plans/${planId}`, {
      status: "paused",
      notes: reason,
    });
  },
};

export default studentService;