import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { Form, Button, Row, Col, Card, message } from "antd";
import DynamicInput from "../components/DynamicInput";

const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploadKey, setUploadKey] = useState(Date.now()); // Clave para resetear el input

    const { settings, setSettings } = useContext(SettingsContext);
    const [imageUrl, setImageUrl] = useState(settings?.logo_url || "");

    const baseBackend = process.env.REACT_APP_BACKEND;

    const logo = baseBackend +'/'+ settings.logo_url;

    const mapLocalStorageToForm = (data) => {
        return {
            academyName: data.academy_name,
            logo: data.logo_url,
            currency: data.currency,
            dateFormat: data.date_format,
            theme: data.theme,
            language: data.language,
            contactEmail: data.contact_email,
            phoneNumber: data.phone_number,
        };
    };

    const mapFormToLocalStorage = (values) => {
        return {
            academy_name: values.academyName,
            logo_url: values.logo_url,
            currency: values.currency,
            date_format: values.dateFormat,
            theme: values.theme,
            language: values.language,
            contact_email: values.contactEmail,
            phone_number: values.phoneNumber,
        };
    };

    useEffect(() => {
        if (settings) {
            const mappedSettings = mapLocalStorageToForm(settings);
            form.setFieldsValue(mappedSettings);
        }
    }, [form, settings]);

    const handleImageUpload = (url) => {
        setImageUrl(url);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const mappedValues = mapFormToLocalStorage({
                ...values,
                logo_url: imageUrl
            });

            const response = await fetch("http://localhost:3000/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedValues),
            });

            const data = await response.json();
            if (response.ok) {
                setSettings(data);
                message.success("Settings updated successfully!");

                // Resetear solo el campo de imagen después de guardar
                setImageUrl("");  // Limpiar el estado de imageUrl
                setUploadKey(Date.now()); // Cambia la clave del input tipo file para resetearlo
            } else {
                alert(`Error: ${data.error || "Failed to update settings"}`);
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update settings.");
        }
        setLoading(false);
    };

    return (
        <Row gutter={24}>
            <Col span={8}>
                <Card
                    style={{
                        textAlign: "center",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <img
                        src={logo}
                        alt="Profile"
                        style={{
                            borderRadius: "50%",
                            width: "150px",
                            height: "150px",
                            marginBottom: "20px",
                        }}
                    />
                    <h3 style={{ color: "#4a90e2" }}>{settings.academy_name}</h3>
                    <p>{settings.contact_email}</p>
                </Card>
            </Col>

            <Col span={16}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark="optional"
                    style={{
                        padding: "24px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <DynamicInput
                        key={uploadKey}  // Clave dinámica para forzar el reinicio
                        label="Logo"
                        name="logo_url"
                        type="image"
                        form={form}
                        rules={[{ required: true, message: "Logo is required" }]}
                        accept="image/*"
                        multiple={false}
                        onImageUpload={handleImageUpload}
                    />
                    <DynamicInput
                        label="Academy Name"
                        name="academyName"
                        type="text"
                        form={form}
                        rules={[{ required: true, message: "Academy name is required" }]}
                    />
                    <DynamicInput
                        label="Currency"
                        name="currency"
                        type="select"
                        options={[
                            { value: "USD", label: "USD" },
                            { value: "COP", label: "COP" },
                        ]}
                        form={form}
                        rules={[{ required: true, message: "Currency is required" }]}
                    />
                    <DynamicInput
                        label="Phone Number"
                        name="phoneNumber"
                        type="text"
                        form={form}
                        rules={[
                            { required: true, message: "Phone number is required" },
                            { pattern: /^[0-9]+$/, message: "Phone number must be digits only" },
                        ]}
                    />
                    <DynamicInput
                        label="Date Format"
                        name="dateFormat"
                        type="select"
                        options={[
                            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                            { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
                            { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
                            { value: "MM-DD-YYYY", label: "MM-DD-YYYY" },
                            { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                        ]}
                        form={form}
                        rules={[{ required: true, message: "Date format is required" }]}
                    />
                    <DynamicInput
                        label="Language"
                        name="language"
                        type="select"
                        options={[
                            { value: "en", label: "English" },
                            { value: "es", label: "Español" },
                        ]}
                        form={form}
                        rules={[{ required: true, message: "Language is required" }]}
                    />
                    <DynamicInput
                        label="Theme"
                        name="theme"
                        type="select"
                        options={[
                            { value: "light", label: "Light" },
                            { value: "dark", label: "Dark" },
                        ]}
                        form={form}
                        rules={[{ required: true, message: "Theme is required" }]}
                    />
                    <DynamicInput
                        label="Contact Email"
                        name="contactEmail"
                        type="text"
                        form={form}
                        rules={[
                            { required: true, message: "Contact Email is required" },
                            { type: "email", message: "Please enter a valid email" },
                        ]}
                    />
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Settings
                    </Button>
                </Form>
            </Col>
        </Row>
    );
};

export default Settings;
