import React, { useContext, useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para redirigir
import { SettingsContext } from "../context/SettingsContext";

const Login = ({ setIsAuthenticated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { setSettings } = useContext(SettingsContext);
    const navigate = useNavigate(); // Para redirigir al Dashboard

    const onFinish = async (values) => {
        setLoading(true);
        setError(""); // Limpiar cualquier error previo

        const { email, password } = values;

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); // Guardar token en localStorage
                setIsAuthenticated(true); // Actualizar el estado de autenticación

                const settingsResponse = await fetch("http://localhost:3000/api/settings", {
                    headers: {
                        Authorization: `Bearer ${data.token}`,
                    },
                });
                const settingsData = await settingsResponse.json();

                setSettings(settingsData); // Guardar los settings en el contexto

                navigate("/dashboard"); // Redirigir al Dashboard
            } else {
                const { message } = await response.json();
                setError(message); // Mostrar mensaje de error
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="login-container" style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2 style={{ textAlign: "center" }}>Login</h2>

            {/* Mostrar el error si existe */}
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

            {/* Formulario de login */}
            <Form name="login-form" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Please input your email!" }]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please input your password!" }]}
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
