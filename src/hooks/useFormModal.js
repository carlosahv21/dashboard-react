// hooks/useFormModal.js
import { useState } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

/**
 * Hook para gestionar el estado, la apertura/cierre y el envío de datos de un formulario CRUD
 * dentro de un Modal.
 * @param {function} request - Función de useFetch para realizar peticiones.
 * @param {string} endpoint - Endpoint base (ej: 'students').
 * @param {number} moduleFieldId - ID para obtener la configuración de campos dinámicos.
 * @param {string} titleSingular - Título en singular para los mensajes (ej: 'Estudiante').
 * @param {object} fixedValues - Valores que se añaden al submit (ej: role_id).
 * @param {object} form - Instancia del formulario de Ant Design (obtenida de Form.useForm() en el componente padre).
 */
export const useFormModal = (request, endpoint, moduleFieldId, titleSingular, fixedValues, form) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [moduleData, setModuleData] = useState(null);

    const openModal = async (id = null) => {
        setEditingId(id);
        setModalVisible(true);
        form.resetFields();

        try {
            const responseFields = await request(`fields/module/${moduleFieldId}`, 'GET');
            setModuleData(responseFields?.data || { blocks: [] });

            if (id) {
                const responseItem = await request(`${endpoint}/${id}`, 'GET');
                const itemData = responseItem.data;

                if ('password' in itemData) itemData.password = "";

                if (itemData.hour) {
                    itemData.hour = dayjs(itemData.hour, "HH:mm");
                }

                if (itemData.payment_date) {
                    itemData.payment_date = dayjs(itemData.payment_date);
                }

                form.setFieldsValue(itemData);
            }
        } catch (err) {
            console.error("Error al cargar formulario/campos:", err);
            message.error(t('forms.errorLoadingFields'));
            setModalVisible(false);
        }
    };
    /**
     * Cierra el modal y limpia el estado.
     * @param {boolean} refetch - Indica si la tabla principal debe refrescarse.
     */
    const closeModal = (refetch = true) => {
        setModalVisible(false);
        setEditingId(null);
        setModuleData(null);
        form.resetFields();
        return refetch;
    };

    /**
     * Maneja el envío del formulario (Creación o Edición).
     * @param {object} values - Valores del formulario de Ant Design.
     * @returns {boolean} True si la operación fue exitosa, false si falló.
     */
    const handleSubmit = async (values) => {
        const transformedValues = { ...values, ...fixedValues };

        if ('hour' in values && values.hour) {
            transformedValues.hour = dayjs(values.hour).format("HH:mm");
        }

        if ('payment_date' in values && values.payment_date) {
            transformedValues.payment_date = dayjs(values.payment_date).format("YYYY-MM-DD");
        }

        if ('password' in transformedValues && !transformedValues.password) {
            delete transformedValues.password;
        }

        try {
            if (editingId) {
                await request(`${endpoint}/${editingId}`, 'PUT', transformedValues);
                message.success(t('forms.updateSuccess', { title: titleSingular }));
            } else {
                const response = await request(`${endpoint}/`, 'POST', transformedValues);
                if (response?.success) {
                    message.success(t('forms.createSuccess', { title: titleSingular }));
                }
            }
            return closeModal(true);
        } catch (error) {
            if (error.errors) {
                const fieldsWithErrors = error.errors.map(err => ({
                    name: err.field,
                    errors: [err.message]
                }));
                form.setFields(fieldsWithErrors);
            } else {
                message.error(error?.message || t('forms.errorSaving', { title: titleSingular }));
            }
        }
    };

    return {
        modalVisible,
        editingId,
        moduleData,
        openModal,
        closeModal,
        handleSubmit
    };
};