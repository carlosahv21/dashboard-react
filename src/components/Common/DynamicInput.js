import React from "react";
import { Form, Input, Select, Upload, DatePicker, TimePicker, Checkbox, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

// Función para convertir `validation_rules` a formato de Ant Design
const parseValidationRules = (validationRules, helperText, type) => {
    const rulesArray = validationRules.split("|");
    let minValue = null;
    let maxValue = null;
    const parsedRules = rulesArray.map(rule => {
        if (rule === "required") {
            return { required: true, message: helperText || "This field is required" };
        }

        // Longitud de caracteres para campos de texto
        if (rule.startsWith("max:") && type === "text") {
            const maxLength = rule.split(":")[1];
            return { max: parseInt(maxLength), message: `Must be at most ${maxLength} characters` };
        }
        if (rule.startsWith("min:") && type === "text") {
            const minLength = rule.split(":")[1];
            return { min: parseInt(minLength), message: `Must be at least ${minLength} characters` };
        }

        // Rango de valores numéricos para campos numéricos
        if (rule.startsWith("max:") && type === "number") {
            maxValue = parseInt(rule.split(":")[1]);
        }
        if (rule.startsWith("min:") && type === "number") {
            minValue = parseInt(rule.split(":")[1]);
        }

        // Validación para campos tipo select con opciones específicas
        if (rule.startsWith("in:")) {
            const options = rule.split(":")[1].split(",");
            return { type: "enum", enum: options, message: `Must be one of the following: ${options.join(", ")}` };
        }

        // Validación para enteros
        if (rule === "integer") {
            return { pattern: /^\d+$/, message: "Must be an integer" };
        }

        // Validación para strings que solo permiten letras y espacios
        if (rule === "string") {
            return { pattern: /^[A-Za-z\s]+$/, message: "Must contain only letters" };
        }
        return null;
    }).filter(Boolean);

    // Agregar regla personalizada para rango de valores si `minValue` y `maxValue` están definidos
    if (minValue !== null && maxValue !== null) {
        parsedRules.push({
            validator: (_, value) => {
                if (value >= minValue && value <= maxValue) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error(`Must be between ${minValue} and ${maxValue}`));
            },
        });
    }

    return parsedRules;
};

const DynamicInput = ({
    label,
    name,
    type,
    options,
    form,
    validation_rules = "",
    default_value,
    hidden = false,
    helper_text = "",
    onImageUpload,
    placeholder
}) => {
    const { request } = useFetch();

    // Manejador para remover la imagen
    const handleRemoveImage = async (file) => {
        try {
            await request(`images/`, "DELETE", { imageUrl: file.url || file.response.url });
            message.success("Image removed successfully");
    
            // Limpia el valor del campo en el formulario
            form.setFieldsValue({ [name]: null });
    
            if (onImageUpload) onImageUpload(null); // Notifica que la imagen fue eliminada
        } catch (error) {
            message.error("Failed to remove image");
            console.error(error);
        }
    };

    // Manejador para subir la imagen
    const customRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append("logo", file);

        try {
            const data = await request("images/", "POST", formData);

            // Solo actualiza el formulario con la URL
            const imageUrl = data.url;
            form.setFieldsValue({ [name]: imageUrl });

            if (onImageUpload) onImageUpload(imageUrl); // Asegúrate de que `onImageUpload` reciba solo la URL
            onSuccess(data);
        } catch (error) {
            message.error("Failed to upload image");
            console.error(error);
            onError(error);
        }
    };

    // Renderizar input según el tipo de campo
    const renderInputComponent = () => {
        if (hidden && !default_value) {
            return <Input type="hidden" />;
        }

        if (hidden) {
            return <Input value={default_value} readOnly />;
        }

        switch (type) {
            case "text":
                return <Input defaultValue={default_value} placeholder={placeholder} />;
            case "number":
                return <Input type="number" defaultValue={default_value} placeholder={placeholder} />;
            case "select":
                return (
                    <Select defaultValue={default_value} placeholder={placeholder}>
                        {options?.map((option) =>
                            typeof option === "string" ? (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ) : (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            )
                        )}
                    </Select>
                );
            case "date":
                return (
                    <DatePicker
                        defaultValue={default_value ? dayjs(default_value) : null}
                        format="YYYY-MM-DD"
                        placeholder={placeholder}
                    />
                );
            case "time":
                return (
                    <TimePicker
                        defaultValue={default_value ? dayjs(default_value, "HH:mm") : null}
                        format="HH:mm"
                        placeholder={placeholder}
                    />
                );
            case "textarea":
                return <TextArea defaultValue={default_value} placeholder={placeholder} style={{ resize: "none" }} />;
            case "image":
                return (
                    <Upload
                        listType="picture-card"
                        showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
                        maxCount={1}
                        customRequest={customRequest}
                        onRemove={handleRemoveImage}
                    >
                        <button style={{ border: 0, background: "none" }} type="button">
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                    </Upload>
                );
            case "boolean":
                return ( 
                    <Checkbox defaultChecked={default_value} placeholder={placeholder} />
                );
            default:
                return <Input defaultValue={default_value} placeholder={placeholder} />;
        }
    };

    return (
        <Form.Item
            label={label}
            name={name}
            rules={parseValidationRules(validation_rules, helper_text, type)}
        >
            {renderInputComponent()}
        </Form.Item>
    );
};

export default DynamicInput;
