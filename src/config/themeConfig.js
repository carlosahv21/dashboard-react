import { theme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = theme;

export const getThemeConfig = (isDarkMode) => {
    if (isDarkMode) {
        return {
            algorithm: darkAlgorithm,
            token: {
                colorBgBase: "#121212",
                colorBgContainer: "#1E1E1E",
                colorText: "#E0E0E0",
                colorTextSecondary: "#A0A0A0",
                colorPrimary: "#0A84FF",
                borderRadius: 8,
                colorBorder: "#2D2D2D",
                colorBorderSecondary: "#2D2D2D",
            },
            components: {
                Layout: {
                    bodyBg: "#121212",
                    headerBg: "#1E1E1E",
                    siderBg: "#1E1E1E",
                },
                Card: {
                    colorBgContainer: "#2D2D2D",
                    colorBorderSecondary: "#2D2D2D",
                    boxShadow: "none",
                },
                Table: {
                    colorBgContainer: "#2D2D2D",
                    headerBg: "#2D2D2D",
                    borderColor: "#2D2D2D",
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
                colorBorderSecondary: "#E0E0E0",
                boxShadow: "none",
            },
            Table: {
                borderColor: "#E0E0E0",
            },
        },
    };
};