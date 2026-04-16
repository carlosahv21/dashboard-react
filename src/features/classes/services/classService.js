import api from "../../../api/axiosInstance";

const classService = {
  /**
   * Obtiene el detalle completo de una clase incluyendo estadísticas y alumnos inscritos.
   * @param {string} id 
   */
  getClassDetails: async (id) => {
    return await api.get(`classes/details/${id}`);
  },

  /**
   * Actualiza los datos de una clase.
   * @param {string} id 
   * @param {Object} data 
   */
  updateClass: async (id, data) => {
    return await api.put(`classes/${id}`, data);
  }
};

export default classService;
