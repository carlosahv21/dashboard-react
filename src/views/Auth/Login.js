import React, { useContext, useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../../context/SettingsContext";
import useFetch from "../../hooks/useFetch";

const Login = ({ setIsAuthenticated }) => {
    const [error, setError] = useState("");
    const { setSettings } = useContext(SettingsContext);
    const navigate = useNavigate();
    const { request, loading } = useFetch(); // Usa el hook useFetch

    const handleLogin = async (values) => {
        setError("");
    
        const { email, password } = values;

        try {
            // Llama a la API de login usando useFetch
            const data = await request("auth/login", "POST", { email, password });

            if (!data.token) {
                alert("Invalid email or password.");
                return;
            }

            // Guarda el token y autentica al usuario
            localStorage.setItem("token", data.token);

            // Llama a la API de configuración usando el token obtenido
            const settingsData = await request("settings", "GET", null, {
                Authorization: `Bearer ${data.token}`,
            });

            if (!settingsData) {
                alert("Failed to load settings.");
                localStorage.removeItem("token");
                setIsAuthenticated(false);
            }

            setIsAuthenticated(true);
            setSettings(settingsData);
            navigate("/");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="login-container" style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2 style={{ textAlign: "center" }}>Login</h2>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

            <Form name="login-form" layout="vertical" onFinish={handleLogin}>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Please input your email!" },
                        { type: "email", message: "Please enter a valid email!" },
                    ]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        { required: true, message: "Please input your password!" },
                        { min: 6, message: "Password must be at least 6 characters long!" },
                    ]}
                >
                    <Input.Password placeholder="Enter your password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
