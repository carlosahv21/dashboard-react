import React from "react";
import { Spin } from "antd";

const LoadingScreen = ({ fullscreen = true }) => {
    if (fullscreen) {
        return (
            <Spin
                size="large"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
            />
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin size="large" />
        </div>
    );
};

export default LoadingScreen;
