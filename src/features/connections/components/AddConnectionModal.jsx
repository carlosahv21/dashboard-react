import React, { useState } from "react";
import { Modal, Input, Typography, message } from "antd";
import { useTranslation } from "react-i18next";
import connectionService from "../services/connectionService";

const { Text } = Typography;

const AddConnectionModal = ({ open, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!userId.trim()) return;

        try {
            setLoading(true);
            await connectionService.sendRequest(userId.trim());
            message.success(t("connections.requestSent"));
            setUserId("");
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            message.error(err.message || t("connections.requestError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={t("connections.sendRequest")}
            open={open}
            onOk={handleSend}
            onCancel={onClose}
            confirmLoading={loading}
            okText={t("connections.send")}
            cancelText={t("global.cancel")}
        >
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                {t("connections.sendRequestDescription")}
            </Text>
            <Input
                placeholder={t("connections.userIdPlaceholder")}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
        </Modal>
    );
};

export default AddConnectionModal;
