import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../../../context/SettingsContext";
import { Form, message } from "antd";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../Components/Common/FormHeader";
import FormSection from "../../../Components/Common/FormSection";
import FormFooter from "../../../Components/Common/FormFooter";

const GeneralInformation = () => {
    const [form] = Form.useForm();
    const { settings, setSettings } = useContext(SettingsContext);
    const [imageUrl, setImageUrl] = useState(settings?.logo_url || "");
    const [uploadKey, setUploadKey] = useState(Date.now());
    const [moduleData, setModuleData] = useState(null);
    const { request, error } = useFetch();

    useEffect(() => {
        const loadFieldsAndSettings = async () => {
            try {
                // Fetch module fields
                const moduleResponse = await request("modules/1/fields", "GET");
                if (moduleResponse.success && moduleResponse.module) {
                    setModuleData(moduleResponse.module);

                    // Prepare default values from module fields
                    const defaultValues = {};
                    moduleResponse.module.blocks?.forEach((block) => {
                        block.fields?.forEach((field) => {
                            if (field.default_value) {
                                defaultValues[field.name] = field.default_value;
                            }
                        });
                    });

                    // Fetch existing settings
                    const settingsResponse = await request("settings", "GET");
                    setSettings(settingsResponse);

                    // Merge settings into default values
                    const mergedValues = {
                        ...defaultValues,
                        ...mapLocalStorageToForm(settingsResponse),
                    };

                    // Set form values
                    form.setFieldsValue(mergedValues);
                }
            } catch (err) {
                message.error(error || "Failed to load data.");
            }
        };

        loadFieldsAndSettings();
    }, [request, form, setSettings, error]);

    const mapLocalStorageToForm = (data) => ({
        academy_name: data.academy_name,
        logo_url: data.logo_url, // Campo de la imagen
        currency: data.currency,
        date_format: data.date_format,
        theme: data.theme,
        language: data.language,
        contact_email: data.contact_email,
        phone_number: data.phone_number,
    });

    const handleImageUpload = (url) => {
        setImageUrl(url);
    };

    const handleSubmit = async (values) => {
        try {
            const mappedValues = {
                ...values,
                logo_url: imageUrl || values.logo_url, // Usa la URL actual o la del formulario
            };
    
            console.log("Valores enviados:", mappedValues);
    
            const response = await request("settings", "POST", mappedValues);
    
            // Actualiza el contexto y el estado local solo si es necesario
            setSettings(response);
            if (response.logo_url) {
                setImageUrl(response.logo_url); // Mantén actualizado `imageUrl`
            }
    
            setUploadKey(Date.now()); // Resetea el key para forzar la recarga del componente
            message.success("Settings updated successfully!");
        } catch {
            console.log("Error al actualizar settings:", error);
            message.error(error || "Failed to update settings.");
        }
    };

    return (
        <>
            <FormHeader
                title={moduleData?.module_name || "General Settings"}
                subtitle="Edit general settings for the academy"
                onCancel={() => message.info("Cancelled")}
                onSave={() => form.submit()}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                    marginTop: "20px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                }}
            >
                {moduleData?.blocks?.map((block) => (
                    <FormSection
                        key={uploadKey}
                        title={block.block_name}
                        fields={block.fields}
                        form={form} // Pasar el formulario
                        onImageUpload={handleImageUpload}
                    />
                ))}

                <FormFooter
                    onCancel={() => message.info("Cancelled")}
                    onSave={() => form.submit()}
                />
            </Form>
        </>
    );
};

export default GeneralInformation;
