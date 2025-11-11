import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';

import FormHeader from '../../components/Common/FormHeader';
import FormSection from '../../components/Common/FormSection';
import FormFooter from '../../components/Common/FormFooter';

import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import dayjs from 'dayjs';

const CreateOrEditClass = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams(); // Detecta si estamos editando
    const { request } = useFetch();
    const [moduleData, setModuleData] = useState(null);
    const isEditMode = Boolean(id); // Define si es creación o edición

    useEffect(() => {
        const fetchModuleAndClassData = async () => {
            try {
                // Cargar los datos del módulo
                const moduleData = await request('fields/5', 'GET');
                setModuleData(moduleData.module);

                // Si estamos en modo edición, cargar los datos de la clase específica
                if (isEditMode) {
                    const classData = await request(`classes/${id}`, 'GET'); // Llama al endpoint para obtener la clase
                    form.setFieldsValue({
                        ...classData,
                        hour: classData.hour ? dayjs(classData.hour, "HH:mm") : null,
                    });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchModuleAndClassData();
    }, [request, id, isEditMode, form]);


    const handleSubmit = async (values) => {
        form.setFields([]);

        const transformedValues = {
            ...values
        };  

        try {
            if (isEditMode) {
                // Usa el método genérico `request` con 'PUT'
                await request(`classes/${id}`, 'PUT', transformedValues);
                message.success('Class updated successfully!');
            } else {
                // Usa `POST` para crear
                await request('classes/', 'POST', transformedValues);
                message.success('Class created successfully!');
            }
            navigate('/classes');
        } catch (error) {
            if (error.errors) {
                const fieldsWithErrors = error.errors.map(err => ({
                    name: err.field,     // el backend envía 'field', no 'path'
                    errors: [err.message]
                }));
                form.setFields(fieldsWithErrors);
            } else {
                message.error(error?.message || 'Failed to save the class. Please try again.');
            }
        }
    };


    return (
        <>
            <FormHeader
                title={isEditMode ? 'Editar Clase' : 'Crear Clase'}
                subtitle={
                    isEditMode
                        ? 'Edita los datos de la clase seleccionada'
                        : 'Completa los datos para crear una nueva clase'
                }
                onCancel={() => navigate('/classes')}
                onSave={() => form.submit()}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={(changedValues) => {
                    const fieldName = Object.keys(changedValues)[0];
                    form.setFields([{ name: fieldName, errors: [] }]); // limpia el error del campo modificado
                }}
                style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                }}
            >
                {moduleData && moduleData.blocks.map((block) => (
                    <FormSection key={block.block_id} title={block.block_name} fields={block.fields} />
                ))}

                <FormFooter
                    onCancel={() => navigate('/classes')}
                    onSave={() => form.submit()}
                />
            </Form>
        </>
    );
};

export default CreateOrEditClass;
