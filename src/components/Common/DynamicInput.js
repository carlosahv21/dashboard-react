import React from "react";
import { Form, Input, Select, Upload, DatePicker, TimePicker, Checkbox, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch";
const { Option } = Select;
const { TextArea } = Input;

// Función para convertir `validation_rules` a formato de Ant Design
const parseValidationRules = (required, type) => {
    const rules = [];

    // ✅ Validar si el campo es obligatorio
    if (required) {
        rules.push({
            required: true,
            message: "Este campo es obligatorio",
        });
    }

    // ✅ Validar el tipo de dato
    if (type) {
        switch (type) {
            case "number":
                rules.push({
                    type: "number",
                    transform: (value) => (value ? Number(value) : value),
                    message: "Debe ser un número válido",
                });
                break;
            case "date":
                rules.push({
                    validator: (_, value) =>
                        value
                            ? Promise.resolve()
                            : Promise.reject(new Error("Debe seleccionar una fecha válida")),
                });
                break;
            case "time":
                rules.push({
                    validator: (_, value) =>
                        value
                            ? Promise.resolve()
                            : Promise.reject(new Error("Debe seleccionar una hora válida")),
                });
                break;
            case "boolean":
                rules.push({
                    type: "boolean",
                    message: "Debe ser verdadero o falso",
                });
                break;
            default:
                rules.push({
                    type: "string",
                    message: "Debe ser un texto válido",
                });
        }
    }

    return rules;
};


const DynamicInput = ({
    label,
    name,
    type,
    options,
    form,
    required,
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

    const renderInputComponent = () => {
        switch (type) {
            case "text": return <Input placeholder={placeholder || `Escribe ${label}`} />;
            case "number": return <Input type="number" placeholder={placeholder || `Escribe ${label}`} />;
            case "select":
                return (
                    <Select placeholder={placeholder || `Selecciona ${label}`}>
                        {options?.map(opt =>
                            typeof opt === "string" ? (
                                <Option key={opt} value={opt}>{opt}</Option>
                            ) : (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            )
                        )}
                    </Select>
                );
            case "date": return <DatePicker format="YYYY-MM-DD" placeholder={placeholder} />;
            case "time": return <TimePicker format="HH:mm" placeholder={placeholder} />;
            case "textarea": return <TextArea placeholder={placeholder || `Escribe ${label}`} style={{ resize: "none" }} />;
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
            case "boolean": return <Checkbox placeholder={placeholder} />;
            default: return <Input placeholder={placeholder || label} />;
        }
    };

    return (
        <Form.Item
            label={label}
            name={name}
            rules={parseValidationRules(required, type)}
        >
            {renderInputComponent()}
        </Form.Item>
    );
};

export default DynamicInput;
