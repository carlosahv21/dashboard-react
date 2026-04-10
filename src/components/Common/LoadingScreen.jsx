import React from "react";
import { Spin, theme } from "antd";

const LoadingScreen = ({ fullscreen = true }) => {
    const { token } = theme.useToken();

    if (fullscreen) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: token.colorBgContainer,
                    zIndex: 9999,
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
            <Spin size="large" />
        </div>
    );
};

export default LoadingScreen;
