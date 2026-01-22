import React, { useState, useEffect, useContext, useMemo } from "react";
import { Form, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import FormSection from "../../../components/Common/FormSection";
import FormFooter from "../../../components/Common/FormFooter";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

const GeneralInformation = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { request } = useFetch();
    const { settings, setSettings } = useContext(AuthContext); // ahora usamos AuthContext
    const [imageUrl, setImageUrl] = useState(settings?.logo_url || "");
    const [uploadKey, setUploadKey] = useState(Date.now());

    const moduleData = useMemo(() => ({
        module_name: t('settings.general'),
        blocks: [
            {
                block_name: t('settings.academyInfo'),
                fields: [
                    { label: t('settings.academyName'), name: "academy_name", type: "text", required: true, placeholder: t('settings.academyNamePlaceholder') },
                    { label: t('settings.logo'), name: "logo_url", type: "image" },
                    { label: t('settings.contactEmail'), name: "contact_email", type: "email" },
                    { label: t('settings.phoneNumber'), name: "phone_number", type: "text" },
                ],
            },
            {
                block_name: t('settings.systemPreferences'),
                fields: [
                    { label: t('settings.currency'), name: "currency", type: "select", options: ["USD", "EUR", "VES"] },
                    { label: t('settings.dateFormat'), name: "date_format", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                    { label: t('settings.theme'), name: "theme", type: "select", options: ["light", "dark"] },
                    { label: t('settings.language'), name: "language", type: "select", options: ["es", "en"] },
                ],
            },
        ],
    }), [t]);

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
            const response = await request("settings", "PUT", payload);

            // Actualizar AuthContext con los datos que devuelve el backend
            const updatedSettings = response || payload;
            setSettings(updatedSettings);

            localStorage.setItem("settings", JSON.stringify(updatedSettings));
            setUploadKey(Date.now());

            message.success(t('settings.updateSuccess'));
        } catch (err) {
            console.error("Error al actualizar settings:", err);
            message.error(t('settings.updateError'));
        }
    };

    return (
        <>
            <FormHeader
                title={moduleData.module_name}
                subtitle={t('settings.generalSubtitle')}
                onCancel={() => null}
                onSave={() => form.submit()}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                    padding: "0 10px",
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
