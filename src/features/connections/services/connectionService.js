import api from "../../../api/axiosInstance";

const connectionService = {
    getConnections: async (params) => {
        return await api.get("user-connections", { params });
    },

    getRequests: async (params) => {
        return await api.get("user-connections", { params: { ...params, status: "pending" } });
    },

    sendRequest: async (receiverId) => {
        return await api.post("user-connections/request", { receiver_id: receiverId });
    },

    acceptRequest: async (id) => {
        return await api.patch(`user-connections/${id}/accept`);
    },

    rejectRequest: async (id) => {
        return await api.patch(`user-connections/${id}/reject`);
    },

    removeConnection: async (id) => {
        return await api.delete(`user-connections/${id}`);
    },
};

export default connectionService;
