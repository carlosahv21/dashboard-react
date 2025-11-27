import React, { useState, useCallback } from "react";
import { Form, Input, Select, Upload, DatePicker, TimePicker, Checkbox, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch";
const { Option } = Select;
const { TextArea } = Input;

// Utility function to debounce API calls, crucial for searchable selects
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

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
            case "text":
                rules.push({
                    type: "string",
                    message: "Debe ser un texto válido",
                });
                break;
            case "number":
                rules.push({
                    validator: (_, value) => {
                        if (!value) return Promise.resolve(); // vacío pasa si no es requerido
                        if (value === "Ilimitadas") return Promise.resolve(); // para max_sessions
                        if (!isNaN(Number(value))) return Promise.resolve();
                        return Promise.reject(new Error("Debe ser un número válido"));
                    },
                });
                break;

            case "select":
                rules.push({
                    validator: (_, value) => {
                        if (!value) return Promise.resolve(); // permite vacío si no es requerido
                        if (typeof value === "string" || typeof value === "number") return Promise.resolve();
                        return Promise.reject(new Error("Debe seleccionar una opción válida"));
                    },
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
            case "image":
                rules.push({
                    required: true,
                    message: "Debe subir una imagen",
                });
                break;
            case "relation":
                rules.push({
                    required: true,
                    message: "Debe seleccionar una opción",
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
    options, // Para selects estáticos
    relationConfig,
    form,
    required,
    placeholder,
    onImageUpload
}) => {
    const { request } = useFetch();

    // Estado para manejar las opciones de relación y la carga
    const [relationOptions, setRelationOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    /**
     * Función para buscar opciones de relación en el backend.
     * Ahora usa POST para enviar la configuración en el cuerpo (body).
     */
    const fetchRelationOptions = useCallback(
        debounce(async (term) => {
            if (!relationConfig) return;

            setLoadingOptions(true);
            try {
                const payload = {
                    relation_config: relationConfig,
                    search: term,
                };

                const data = await request(`fields/relation`, "POST", payload);
                setRelationOptions(data.options);
            } catch (error) {
                message.error("Error al cargar opciones de relación.");
                console.error("Error fetching relation options:", error);
                setRelationOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        }, 300),
        [relationConfig, request]
    );

    React.useEffect(() => {
        if (type === "relation" && relationConfig) {
            fetchRelationOptions("");
        }
    }, [type, relationConfig, fetchRelationOptions]);


    // Manejador para remover la imagen
    const handleRemoveImage = async (file) => {
        try {
            await request(`images/`, "DELETE", { imageUrl: file.url || file.response.url });
            message.success("Image removed successfully");

            form.setFieldsValue({ [name]: null });

            if (onImageUpload) onImageUpload(null);
        } catch (error) {
            message.error("Failed to remove image");
            console.error(error);
        }
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append("logo", file);

        try {
            const data = await request("images/", "POST", formData);

            const imageUrl = data.url;
            form.setFieldsValue({ [name]: imageUrl });

            if (onImageUpload) onImageUpload(imageUrl);
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
                        {options?.map(opt => (
                            <Option key={opt.toString()} value={opt.toString()}>
                                {opt.toString()}
                            </Option>
                        ))}
                    </Select>

                );
            case "relation":
                if (!relationConfig) {
                    console.error(`DynamicInput: El campo '${name}' de tipo 'relation' requiere 'relationConfig'.`);
                    return <Input disabled value="Error: Falta Configuración de Relación" />;
                }
                return (
                    <Select
                        placeholder={placeholder || `Busca y selecciona ${label}`}
                        showSearch // Permite la búsqueda
                        loading={loadingOptions} // Muestra el estado de carga
                        onSearch={fetchRelationOptions} // Dispara la búsqueda al escribir (con debounce)
                        filterOption={false} // Deshabilita el filtro del lado del cliente, ya que el backend lo hace
                        notFoundContent={loadingOptions ? 'Cargando opciones...' : 'No se encontraron resultados'}
                    >
                        {relationOptions?.map(opt => (
                            <Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Option>
                        ))}
                    </Select>
                );
            case "date": return <DatePicker format="YYYY-MM-DD" placeholder={placeholder} />;
            case "time": return <TimePicker format="HH:mm" placeholder={placeholder} needConfirm={false} minuteStep={15} use12Hours />;
            case "textarea": return <TextArea placeholder={placeholder || `Escribe ${label}`} style={{ resize: "none" }} />;
            case "image":
                return (
                    <Upload
                        listType="picture-card"
                        showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
                        maxCount={1}
                        customRequest={customRequest}
                        beforeUpload={(file) => {
                            const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
                            if (!isJpgOrPng) {
                                message.error("Solo se permiten archivos JPG o PNG");
                                return Upload.LIST_IGNORE; // evita que se agregue el archivo
                            }

                            const isLt5M = file.size / 1024 / 1024 < 5;
                            if (!isLt5M) {
                                message.error("La imagen debe ser menor a 5MB");
                                return Upload.LIST_IGNORE;
                            }

                            return true; // permite subir
                        }}
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

    const valueProp = type === 'boolean' ? { valuePropName: 'checked' } : {};
    const imageProps = type === 'image' ? {
        getValueFromEvent: ({ fileList }) => fileList.length > 0 ? form.getFieldValue(name) : null
    } : {};


    return (
        <Form.Item
            label={label}
            name={name}
            rules={parseValidationRules(required, type)}
            {...valueProp}
            {...imageProps}
        >
            {renderInputComponent()}
        </Form.Item>
    );
};

export default DynamicInput;