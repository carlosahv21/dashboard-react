import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../../../context/SettingsContext";
import { Form, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import FormSection from "../../../components/Common/FormSection";
import FormFooter from "../../../components/Common/FormFooter";
import useFetch from "../../../hooks/useFetch";

const GeneralInformation = () => {
    const [form] = Form.useForm();
    const { request } = useFetch();
    const { settings, setSettings } = useContext(SettingsContext);
    const [imageUrl, setImageUrl] = useState(settings?.logo_url || "");
    const [uploadKey, setUploadKey] = useState(Date.now());

    // 👇 Definimos el esquema local de campos (puede ir a un JSON después)
    const moduleData = {
        module_name: "Configuración General",
        blocks: [
            {
                block_name: "Información de la Academia",
                fields: [
                    {
                        label: "Nombre de la Academia",
                        name: "academy_name",
                        type: "text",
                        required: true,
                        placeholder: "Ej: Academia Estelar",
                    },
                    { label: "Logo", name: "logo_url", type: "image" },
                    { label: "Correo de contacto", name: "contact_email", type: "email" },
                    { label: "Número de teléfono", name: "phone_number", type: "text" },
                ],
            },
            {
                block_name: "Preferencias del Sistema",
                fields: [
                    { label: "Moneda", name: "currency", type: "select", options: ["USD", "EUR", "VES"] },
                    {
                        label: "Formato de fecha",
                        name: "date_format",
                        type: "select",
                        options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
                    },
                    { label: "Tema", name: "theme", type: "select", options: ["light", "dark"] },
                    { label: "Idioma", name: "language", type: "select", options: ["es", "en"] },
                ],
            },
        ],
    };

    // 👇 Cargar configuración desde localStorage o contexto
    useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem("settings")) || settings;
        if (storedSettings) {
            form.setFieldsValue(storedSettings);
            setImageUrl(storedSettings.logo_url || "");
        }
    }, [form, settings]);

    const handleImageUpload = (url) => setImageUrl(url);

    const handleSubmit = async (values) => {
        try {
            const updatedSettings = {
                ...values,
                logo_url: imageUrl || values.logo_url,
            };

            const response = await request("settings", "POST", updatedSettings);

            // Guardar en contexto y localStorage
            if (response.logo_url) {
                setImageUrl(response.logo_url);
            }

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
                title={moduleData?.module_name || "General Settings"}
                subtitle="Edit general settings for the academy"
                onCancel={() => {}}
                onSave={() => form.submit()}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                    marginTop: 20,
                    padding: 20,
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
                    onCancel={() => {}}
                    onSave={() => form.submit()}
                />
            </Form>
        </>
    );
};

export default GeneralInformation;
