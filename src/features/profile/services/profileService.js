import api from "../../../api/axiosInstance";

/**
 * Service for profile-related API calls.
 */
const profileService = {
  /**
   * Fetches student details.
   * @param {string} userId
   */
  getProfile: (userId) => api.get(`users/details/${userId}`),

  /**
   * Updates student profile information.
   * @param {string} userId
   * @param {Object} data
   */
  updateProfile: (userId, data) => api.put(`users/${userId}`, data),

  /**
   * Resets user password.
   * @param {Object} data
   */
  resetPassword: (data) => api.post("auth/reset-password", data),

  /**
   * Uploads an image.
   * @param {FormData} formData
   */
  uploadImage: (formData) => api.post("images", formData),
};

export default profileService;
