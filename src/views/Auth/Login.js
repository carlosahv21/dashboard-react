// src/views/Auth/Login.js
import React, { useState, useContext } from "react";
import { Form, Input, Button, Alert, Row, Col, Card, Typography, Space } from "antd"; // <-- Añadidos Row, Col, Card, Typography, Space
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { LinkOutlined, MailOutlined, InstagramOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons'; // Importamos iconos

// Importa el CSS del login
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { request, loading } = useFetch();

    const handleLogin = async (values) => {
        setError("");
        try {
            const data = await request("auth/login", "POST", values);
            if (!data.token) {
                setError("Credenciales inválidas. Intenta de nuevo.");
                return;
            }
            login(data.token);
            navigate("/");
        } catch (err) {
            setError(err.message || "Ocurrió un error. Intenta de nuevo.");
        }
    };

    return (
        <Row className="login-page-container" wrap={false}>
            <Col xs={0} md={10} lg={12} className="login-left-panel">
                <div className="login-branding">
                    <LinkOutlined style={{ fontSize: '24px', marginRight: 8 }} /> {/* Icono de ejemplo para logo */}
                    <Text strong className="login-app-name" style={{ color: 'white', fontSize: '20px' }}>
                        My Discounted Labs
                    </Text>
                </div>

                <div className="login-illustration">
                    {/* El fondo y la imagen se manejan con CSS para este div */}
                </div>

                <div className="login-copyright">
                    Copyright © {new Date().getFullYear()}. Name App. All rights reserved.
                </div>
            </Col>
            <Col xs={24} md={14} lg={12} className="login-right-panel">
                <Card className="login-form-card">
                    <Title level={2} className="login-title">Log in</Title>

                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

                    <Form name="login-form" layout="vertical" onFinish={handleLogin}>
                        <Form.Item label="Email" name="email"
                            rules={[
                                { required: true, message: "Por favor ingresa tu email!" },
                                { type: "email", message: "Por favor ingresa un email válido!" },
                            ]}
                        >
                            <Input placeholder="nombre@ejemplo.com" />
                        </Form.Item>

                        <Form.Item label="Contraseña" name="password"
                            rules={[
                                { required: true, message: "Por favor ingresa tu contraseña!" },
                                { min: 6, message: "La contraseña debe tener al menos 6 caracteres!" },
                            ]}
                        >
                            <Input.Password placeholder="••••••••" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                Iniciar Sesión
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="login-footer-links">
                        <Text className="signup-prompt">O</Text>
                    </div>

                    {/* boton para loegearse con google */}
                    

                    <div className="social-media-links">
                        <Space size="large">
                            <LinkedinOutlined className="social-icon" />
                            <InstagramOutlined className="social-icon" />
                            <FacebookOutlined className="social-icon" />
                            <TwitterOutlined className="social-icon" />
                        </Space>
                    </div>

                    <div className="contact-info">
                        <Space size="middle">
                            <Text><MailOutlined /> info@nameapp.com</Text>
                        </Space>
                    </div>

                </Card>
            </Col>
        </Row>
    );
};

export default Login;