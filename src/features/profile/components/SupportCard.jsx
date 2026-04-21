import React from "react";
import { Button, theme } from "antd";
import DetailCard from "../../../components/Common/DetailCard";
import { QuestionOutlined, ArrowRightOutlined } from "@ant-design/icons";

const SupportCard = ({ settings, t }) => {
    const { token } = theme.useToken();
    const isDarkMode = settings?.theme === "dark";

    return (
        <DetailCard
            style={{
                boxShadow: isDarkMode
                    ? "0 4px 12px rgba(0,0,0,0.2)"
                    : "0 4px 20px rgba(0,0,0,0.05)",
                background: isDarkMode
                    ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                    : "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
                border: `1px solid ${isDarkMode ? "#333" : "#bae7ff"}`,
            }}
        >
            <div style={{ display: "flex", gap: 16 }}>
                <div
                    style={{
                        width: 50,
                        height: 48,
                        borderRadius: "50%",
                        background: token.colorPrimary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0,
                    }}
                >
                    <QuestionOutlined />
                </div>
                <div>
                    <h4
                        style={{
                            margin: 0,
                            fontWeight: "bold",
                            fontSize: 16,
                            color: token.colorText,
                        }}
                    >
                        {t("settings.supportCardTitle")}
                    </h4>
                    <p
                        style={{
                            margin: "8px 0 16px",
                            color: token.colorTextSecondary,
                            fontSize: 14,
                        }}
                    >
                        {t("settings.supportCardDescription")}
                    </p>
                    <Button
                        type="link"
                        style={{ padding: 0, color: token.colorPrimary, fontWeight: "600" }}
                    >
                        {t("settings.contactSupport")} <ArrowRightOutlined />
                    </Button>
                </div>
            </div>
        </DetailCard>
    );
};

export default SupportCard;
