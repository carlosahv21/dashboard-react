import React, { useState, useCallback } from "react";
import { Form, Input, Select, Upload, DatePicker, TimePicker, Checkbox, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
const parseValidationRules = (required, type, t) => {
    const rules = [];

    // ✅ Validar si el campo es obligatorio
    if (required) {
        rules.push({
            required: true,
            message: t('forms.requiredField'),
        });
    }

    // ✅ Validar el tipo de dato
    if (type) {
        switch (type) {
            case "text":
                rules.push({
                    type: "string",
                    message: t('forms.invalidText'),
                });
                break;
            case "number":
                rules.push({
                    validator: (_, value) => {
                        if (!value) return Promise.resolve(); // vacío pasa si no es requerido
                        if (value === "Ilimitadas") return Promise.resolve(); // para max_sessions
                        if (!isNaN(Number(value))) return Promise.resolve();
                        return Promise.reject(new Error(t('forms.invalidNumber')));
                    },
                });
                break;

            case "select":
                rules.push({
                    validator: (_, value) => {
                        if (!value) return Promise.resolve(); // permite vacío si no es requerido
                        if (typeof value === "string" || typeof value === "number") return Promise.resolve();
                        return Promise.reject(new Error(t('forms.invalidSelect')));
                    },
                });
                break;
            case "date":
                rules.push({
                    validator: (_, value) =>
                        value
                            ? Promise.resolve()
                            : Promise.reject(new Error(t('forms.invalidDate'))),
                });
                break;
            case "time":
                rules.push({
                    validator: (_, value) =>
                        value
                            ? Promise.resolve()
                            : Promise.reject(new Error(t('forms.invalidTime'))),
                });
                break;
            case "boolean":
                rules.push({
                    type: "boolean",
                    message: t('forms.invalidBoolean'),
                });
                break;
            case "image":
                rules.push({
                    required: true,
                    message: t('forms.invalidImage'),
                });
                break;
            case "relation":
                rules.push({
                    required: true,
                    message: t('forms.invalidRelation'),
                });
                break;
            case "range": // Rango de fechas
                rules.push({
                    type: "array",
                    message: t('forms.invalidDateRange'),
                });
                break;
            default:
                rules.push({
                    type: "string",
                    message: t('forms.invalidText'),
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
    const { t } = useTranslation();
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

                const response = await request(`fields/relation`, "POST", payload);
                setRelationOptions(response.data);
            } catch (error) {
                message.error(t('forms.relationLoadError'));
                console.error("Error fetching relation options:", error);
                setRelationOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        }, 300),
        [relationConfig, request, t]
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
            message.success(t('forms.removeImageSuccess'));

            form.setFieldsValue({ [name]: null });

            if (onImageUpload) onImageUpload(null);
        } catch (error) {
            message.error(t('forms.removeImageError'));
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
            message.error(t('forms.uploadImageError'));
            console.error(error);
            onError(error);
        }
    };

    const renderInputComponent = () => {
        const p = placeholder || label;
        switch (type) {
            case "text": return <Input placeholder={p} />;
            case "number": return <Input type="number" placeholder={p} />;
            case "select":
                return (
                    <Select placeholder={p}>
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
                    return <Input disabled value={t('forms.relationErrorMissingConfig')} />;
                }
                return (
                    <Select
                        placeholder={p}
                        showSearch // Permite la búsqueda
                        loading={loadingOptions} // Muestra el estado de carga
                        onSearch={fetchRelationOptions} // Dispara la búsqueda al escribir (con debounce)
                        filterOption={false} // Deshabilita el filtro del lado del cliente, ya que el backend lo hace
                        notFoundContent={loadingOptions ? t('forms.loadingOptions') : t('forms.noOptionsFound')}
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
            case "textarea": return <TextArea placeholder={p} style={{ resize: "none" }} />;
            case "range":
                return <RangePicker format="YYYY-MM-DD" />;
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
                                message.error(t('forms.imageTypeErrorMessage'));
                                return Upload.LIST_IGNORE; // evita que se agregue el archivo
                            }

                            const isLt5M = file.size / 1024 / 1024 < 5;
                            if (!isLt5M) {
                                message.error(t('forms.imageSizeErrorMessage'));
                                return Upload.LIST_IGNORE;
                            }

                            return true; // permite subir
                        }}
                        onRemove={handleRemoveImage}
                    >
                        <button style={{ border: 0, background: "none" }} type="button">
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>{t('forms.upload')}</div>
                        </button>
                    </Upload>
                );
            case "boolean": return <Checkbox placeholder={placeholder} />;
            default: return <Input placeholder={p} />;
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
            rules={parseValidationRules(required, type, t)}
            {...valueProp}
            {...imageProps}
        >
            {renderInputComponent()}
        </Form.Item>
    );
};

export default DynamicInput;