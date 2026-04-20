import api from "../../../api/axiosInstance";

const planService = {
  /**
   * Obtiene el detalle completo de un plan incluyendo estadísticas y alumnos inscritos.
   * @param {string} id 
   */
  getPlanDetails: async (id) => {
    return await api.get(`plans/details/${id}`);
  },

  /**
   * Actualiza los datos de un plan.
   * @param {string} id 
   * @param {Object} data 
   */
  updatePlan: async (id, data) => {
    return await api.put(`plans/${id}`, data);
  }
};

export default planService;
