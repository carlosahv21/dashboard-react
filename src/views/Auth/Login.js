// src/views/Auth/Login.js
import React, { useState, useContext, useEffect } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import {
    MailOutlined,
    LockOutlined,
    LoginOutlined,
    ManOutlined,
    SunOutlined,
    MoonOutlined
} from '@ant-design/icons';
import './Login.css';

const slides = [
    {
        title: "Tu Talento, Nuestro Motor",
        text: "Tú pones la pasión y el arte; nosotros nos encargamos del orden. Gestiona alumnos, pagos y planes sin perder tu enfoque creativo.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_MG7Wqc850CDYWrgIuOQT4wWxpLRnp3lmumTfb2HIFCVZmPqznMXqmCaTkZ2E7UO6FRk19nk6v_hEXjuYWkyDohNeyFlAZU8GBj8qlKaPIRa7Mc_hccheBKbr2MBV07aCgPcdMmS1ihldg7Vggea1FNsFUeuM1I7xesAM8WT-0YG-nk_jMfr0ic2lB1H0VHPS2GIUTrNdUmf59C0UJGi22G1lPbwbtdhKWnESONnEhdQhNrTLKYg7qorolB-2we-yd-Fzl3U2H8Y"
    },
    {
        title: "Tu Academia, Tus Reglas",
        text: "Un espacio diseñado para crecer. Personaliza tu comunicación, conecta tu propio correo y mantén tu identidad de marca.",
        image: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop"
    },
    {
        title: "Conexión Total con tus Alumnos",
        text: "Automatiza correos de bienvenida, monitorea vencimientos y mantén a tu comunidad artística informada con un solo clic.",
        image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=1200&auto=format&fit=crop"
    }
];

const Login = () => {
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { request, loading } = useFetch();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (values) => {
        setError("");
        try {
            const response = await request("auth/login", "POST", values);
            if (!response.data.token) {
                message.error("Credenciales inválidas. Intenta de nuevo.");
                setError("Credenciales inválidas");
                return;
            }
            login(response.data.token);
            navigate("/");
        } catch (err) {
            const msg = err.message || "Ocurrió un error. Intenta de nuevo.";
            message.error(msg);
            setError(msg);
        }
    };

    return (
        <div className="dance-login-container" data-theme={theme}>
            {/* Navegación Superior (Solo Links y Toggles) */}
            <nav className="dance-nav">
                <div className="dance-brand-header">
                    <div className="dance-logo-box">
                        <ManOutlined style={{ fontSize: '1.5rem' }} />
                    </div>
                    <span className="dance-nav-title" style={{ fontSize: '1.5rem' }}>DanceFlow</span>
                </div>
                <div className="dance-nav-actions">
                    <div className="dance-nav-links">
                        <a className="dance-nav-link" href="#">Inicio</a>
                        <a className="dance-nav-link" href="#">Clases</a>
                        <a className="dance-nav-link" href="#">Nuestra Academia</a>
                        <a className="dance-nav-link" href="#">Contacto</a>
                    </div>

                    {/* Botón de Cambio de Tema */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        title={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                    </button>
                </div>
            </nav>

            <main className="dance-main">
                <div className="login-left-panel">
                    <div className="dance-bg-pattern" style={{ position: 'absolute', inset: 0 }}></div>

                    <div className="login-content-wrapper" style={{ width: '100%', maxWidth: '28rem', zIndex: 10 }}>


                        <div className="login-form-container">
                            <div className="login-header" style={{ marginBottom: '0' }}>
                                <h1 className="login-title">Bienvenido</h1>
                                <p className="login-subtitle">Por favor, ingresa tus credenciales para acceder al portal.</p>
                                <div className="login-divider"></div>
                            </div>

                            <Form
                                name="login-form"
                                layout="vertical"
                                onFinish={handleLogin}
                                requiredMark={false}
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    label="Correo Electrónico"
                                    rules={[
                                        { required: true, message: "¡Por favor ingresa tu email!" },
                                        { type: "email", message: "¡Por favor ingresa un email válido!" },
                                    ]}
                                    style={{ marginBottom: '0' }}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder="nombre@academia.com"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Contraseña"
                                    rules={[
                                        { required: true, message: "¡Por favor ingresa tu contraseña!" },
                                        { min: 6, message: "¡La contraseña debe tener al menos 6 caracteres!" },
                                    ]}
                                    style={{ marginBottom: '10px' }}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="••••••••"
                                    />
                                </Form.Item>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>Recordar por 30 días</Checkbox>
                                    </Form.Item>
                                    <a className="forgot-password-link" href="#">¿Olvidaste tu contraseña?</a>
                                </div>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block loading={loading}>
                                        Iniciar Sesión <LoginOutlined style={{ fontSize: '1.2rem', marginLeft: '8px' }} />
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div className="login-footer-text">
                                <p> <a href="#">Contacta a administración</a> si necesitas acceso o has perdido los detalles de tu cuenta.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Slider de Imágenes */}
                <div className="login-right-panel">
                    <div className="dance-image-overlay">
                        <img
                            key={currentSlide}
                            alt="Bailarín Profesional"
                            className="dance-image"
                            src={slides[currentSlide].image}
                        />
                        <div className="dance-gradient-r"></div>
                        <div className="dance-gradient-t"></div>
                    </div>

                    <div className="dance-content-box">
                        <div className="dance-text-wrapper">
                            <div className="pro-badge">
                                <span className="pro-badge-dot"></span>
                                <span className="pro-text">Suite Profesional</span>
                            </div>
                            <h2 className="hero-title">
                                {slides[currentSlide].title}
                            </h2>
                            <p className="hero-desc">
                                {slides[currentSlide].text}
                            </p>
                            <div className="hero-dots">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={index === currentSlide ? "hero-dot-active" : "hero-dot"}
                                        onClick={() => setCurrentSlide(index)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="version-tag">
                        TECNOLOGÍA PARA EL ARTE • V1.0.0
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;