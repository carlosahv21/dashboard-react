import { theme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = theme;

export const getThemeConfig = (isDarkMode) => {
    if (isDarkMode) {
        return {
            algorithm: darkAlgorithm,
            token: {
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                colorBgBase: "#121212",
                colorBgContainer: "#1E1E1E",
                colorText: "#E0E0E0",
                colorTextSecondary: "#A0A0A0",
                colorPrimary: "#0A84FF",
                borderRadius: 8,
                colorBorder: "#2D2D2D",
                colorBorderSecondary: "#2D2D2D"
            },
            components: {
                Layout: {
                    bodyBg: "#121212",
                    headerBg: "#1E1E1E",
                    siderBg: "#1E1E1E",
                },
                Card: {
                    colorBgContainer: "#1E1E1E", // Sincronizado con container
                    colorBorderSecondary: "rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                },
                Table: {
                    colorBgContainer: "transparent",
                    headerBg: "rgba(255, 255, 255, 0.02)",
                    borderColor: "rgba(255, 255, 255, 0.05)",
                },
                Menu: {
                    darkItemBg: "#1E1E1E",
                    itemSelectedBg: "rgba(10, 132, 255, 0.1)",
                    itemBg: "#1E1E1E",
                },
            },
        };
    }

    return {
        algorithm: defaultAlgorithm,
        token: {
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            colorBgBase: "#F8F9FA",
            colorBgContainer: "#FFFFFF",
            colorText: "#2D3436",
            colorTextSecondary: "#6C757D",
            colorPrimary: "#0A84FF",
            borderRadius: 8,
            colorBorder: "#E0E0E0",
            colorBorderSecondary: "#E0E0E0",
        },
        components: {
            Card: {
                colorBorderSecondary: "rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            },
            Table: {
                borderColor: "#F0F0F0",
            },
        },
    };
};