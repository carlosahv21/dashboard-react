import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';

import FormHeader from '../../Components/Common/FormHeader';
import FormSection from '../../Components/Common/FormSection';
import FormFooter from '../../Components/Common/FormFooter';

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
                const moduleData = await request('modules/5/fields', 'GET');
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
        const transformedValues = {
            ...values,
            date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
            hour: values.hour ? dayjs(values.hour).format('HH:mm') : null,
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
            console.error('Error saving class:', error);
            message.error('Failed to save the class. Please try again.');
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
