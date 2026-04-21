import React, { useState, useEffect, useContext, useMemo } from "react";
import { Form, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import FormSection from "../../../components/Common/FormSection";
import FormFooter from "../../../components/Common/FormFooter";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

/** Academy-level fields updated via the settings endpoint */
const ACADEMY_FIELDS = ["name", "logo", "currency", "date_format", "address"];
/** User-level preference fields */
const USER_FIELDS = ["theme", "language"];

const GeneralInformation = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { request } = useFetch();
    const { academy, user, login } = useContext(AuthContext); // use login to sync state
    const [imageUrl, setImageUrl] = useState(academy?.logo_url || "");
    const [uploadKey, setUploadKey] = useState(Date.now());

    const moduleData = useMemo(() => ({
        module_name: t('settings.general'),
        blocks: [
            {
                block_name: t('settings.academyInfo'),
                fields: [
                    { label: t('settings.academyName'), name: "name", type: "text", required: true, placeholder: t('settings.academyNamePlaceholder') },
                    { label: t('settings.logo'), name: "logo", type: "image" }
                ],
            },
            {
                block_name: t('settings.systemPreferences'),
                fields: [
                    { label: t('settings.currency'), name: "currency", type: "select", options: ["USD", "EUR", "VES"] },
                    { label: t('settings.dateFormat'), name: "date_format", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                    { label: t('settings.theme'), name: "theme", type: "select", options: [
                        { value: "light", label: t('settings.themes.light') },
                        { value: "dark", label: t('settings.themes.dark') }
                    ]},
                    { label: t('settings.language'), name: "language", type: "select", options: [
                        { value: "es", label: t('settings.languages.es') },
                        { value: "en", label: t('settings.languages.en') }
                    ]},
                ],
            },
        ],
    }), [t]);

    // Load current settings into the form on mount/changes
    useEffect(() => {
        if (!form) return;
        // Merge academy + user fields into form values
        const merged = { ...academy, theme: user?.theme, language: user?.language };
        form.setFieldsValue(merged);
        setImageUrl(academy?.logo_url || "");
    }, [form, academy, user]);

    const handleImageUpload = (url) => setImageUrl(url);

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, logo_url: imageUrl || values.logo_url };
            const response = await request("settings", "PUT", payload);
            const resultData = response?.data || response;

            // Sync updated values back through the login helper which persists
            // each slice (academy / user) while keeping the token intact.
            const academyUpdates = {};
            const userUpdates = {};
            const merged = { ...payload, ...(typeof resultData === 'object' ? resultData : {}) };

            Object.entries(merged).forEach(([key, val]) => {
                if (ACADEMY_FIELDS.includes(key)) academyUpdates[key] = val;
                if (USER_FIELDS.includes(key)) userUpdates[key] = val;
            });

            // Re-use login's partial update logic: pass only changed slices
            login({
                token: localStorage.getItem("token"),
                academy: { ...academy, ...academyUpdates },
                user: { ...user, ...userUpdates },
            });

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
