import React, { useState, useContext } from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";

const Login = () => {
    const [error, setError] = useState("");
    const { setUser, setSettings, setRoutes, setToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { request, loading } = useFetch();

    const handleLogin = async (values) => {
        setError("");

        try {
            const data = await request("auth/login", "POST", values);

            if (!data.token) {
                setError("Invalid email or password.");
                return;
            }

            // Guardar token en localStorage
            localStorage.setItem("token", data.token);

            setToken(data.token);
            setUser(data.user);
            setSettings(data.settings);
            setRoutes(data.routes || []);

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
