import React, { useState, useEffect, useContext } from "react";
import { Form, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import FormSection from "../../../components/Common/FormSection";
import FormFooter from "../../../components/Common/FormFooter";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";

const GeneralInformation = () => {
    const [form] = Form.useForm();
    const { request } = useFetch();
    const { settings, setSettings } = useContext(AuthContext); // ahora usamos AuthContext
    const [imageUrl, setImageUrl] = useState(settings?.logo_url || "");
    const [uploadKey, setUploadKey] = useState(Date.now());

    const moduleData = {
        module_name: "Configuración General",
        blocks: [
            {
                block_name: "Información de la Academia",
                fields: [
                    { label: "Nombre de la Academia", name: "academy_name", type: "text", required: true, placeholder: "Ej: Academia Estelar" },
                    { label: "Logo", name: "logo_url", type: "image" },
                    { label: "Correo de contacto", name: "contact_email", type: "email" },
                    { label: "Número de teléfono", name: "phone_number", type: "text" },
                ],
            },
            {
                block_name: "Preferencias del Sistema",
                fields: [
                    { label: "Moneda", name: "currency", type: "select", options: ["USD", "EUR", "VES"] },
                    { label: "Formato de fecha", name: "date_format", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                    { label: "Tema", name: "theme", type: "select", options: ["light", "dark"] },
                    { label: "Idioma", name: "language", type: "select", options: ["es", "en"] },
                ],
            },
        ],
    };

    // Cargar settings desde AuthContext en el formulario
    useEffect(() => {
        if (!form) return;
        if (settings) {
            form.setFieldsValue(settings);
            setImageUrl(settings.logo_url || "");
        }
    }, [form, settings]);

    const handleImageUpload = (url) => setImageUrl(url);

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, logo_url: imageUrl || values.logo_url };
            const response = await request("settings", "POST", payload);

            // Actualizar AuthContext con los datos que devuelve el backend
            const updatedSettings = response || payload;
            setSettings(updatedSettings);

            localStorage.setItem("settings", JSON.stringify(updatedSettings));
            setUploadKey(Date.now());

            message.success("Configuración actualizada correctamente");
        } catch (err) {
            console.error("Error al actualizar settings:", err);
            message.error("No se pudo actualizar la configuración");
        }
    };

    return (
        <>
            <FormHeader
                title={moduleData.module_name}
                subtitle="Edit general settings for the academy"
                onCancel={() => null}
                onSave={() => form.submit()}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                    padding: "0 10px",
                    backgroundColor: "#fff",
                    borderRadius: 8,
                }}
            >
                {moduleData.blocks.map((block) => (
                    <FormSection
                        key={`${block.block_name}-${uploadKey}`}
                        title={block.block_name}
                        fields={block.fields}
                        form={form}
                        onImageUpload={handleImageUpload}
                    />
                ))}

                <FormFooter
                    onCancel={() => null}
                    onSave={() => form.submit()}
                />
            </Form>
        </>
    );
};

export default GeneralInformation;
