import React, { useState, useEffect } from "react";
import { Divider, Form, Select, Card, message, Row, Col, Button, Modal, Checkbox, Input, Skeleton, Empty, Space, Tooltip } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../Components/Common/FormHeader";
import FormFooter from "../../../Components/Common/FormFooter";

const FieldCard = ({ block, onEdit, onAddField, onDeleteField, onDeleteBlock }) => (
    <Card
        style={{ marginBottom: '10px' }}
        type="inner"
        title={
            <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Space>
                    {block.block_name}
                </Space>
                <Space>
                    <Tooltip title="Agregar campo">
                        <Button
                            size="small"
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={() => onAddField(block.block_id)}
                        ></Button>
                    </Tooltip>
                    <Tooltip title="Eliminar bloque">
                        <Button
                            size="small"
                            type="link"
                            danger
                            onClick={() => onDeleteBlock(block.block_id)}
                            icon={<DeleteOutlined />} ></Button>
                    </Tooltip>
                </Space>
            </Space>
        }
    >
        <Row>
            {block.fields.map(field => (
                <Col
                    key={field.field_id}
                    span={12}
                    style={{
                        marginTop: '10px',
                        marginBottom: '10px',
                        backgroundColor: '#f5f5f5',
                        padding: '10px'
                    }}
                >
                    <Space>
                        <span>
                            {field.label}
                            {field.required === 1 && <span style={{ color: 'red' }}> *</span>}
                        </span>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(field)}
                        />
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDeleteField(field.field_id)}
                        />
                    </Space>
                </Col>
            ))}
        </Row>

    </Card>
);

const CustomFields = () => {
    const { request } = useFetch();
    const [form] = Form.useForm();
    const [modules, setModules] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [editField, setEditField] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [blockForm] = Form.useForm();

    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [fieldForm] = Form.useForm();

    const [currentBlockId, setCurrentBlockId] = useState(null);
    const [fieldType, setFieldType] = useState(null);

    const { confirm } = Modal;

    useEffect(() => {
        const fetchFields = async () => {
            setLoading(true);
            try {
                const response = await request("modules", "GET");
                const modulesWithFields = response.data.filter(module => module.has_fields);
                setModules(modulesWithFields);

                if (modulesWithFields.length > 0) {
                    await changeModule(modulesWithFields[0].id);
                }
            } catch (err) {
                message.error(err.message || "Failed to fetch fields.");
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [request]);

    const changeModule = async (value) => {
        setSelectedModule(value);
        setLoading(true);
        try {
            const response = await request(`fields/${value}`, "GET");
            setBlocks(response?.module?.blocks || []);
        } catch (err) {
            message.error(err.message || "Failed to fetch fields.");
        } finally {
            setLoading(false);
        }
    };

    const showModal = (field) => {
        form.setFieldsValue({ ...field });
        setEditField(field);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, id: editField.field_id, module_id: selectedModule };
            await request(`fields/${editField.field_id}`, "PUT", payload);
            message.success("Field updated successfully.");
            setIsModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error(err.message || "Failed to update field.");
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setEditField(null);
        setIsModalOpen(false);
    };

    const handleAddBlock = () => {
        setIsBlockModalOpen(true);
        blockForm.resetFields();
    };

    const handleConfirmDeleteBlock = async (blockId) => {
        confirm({
            title: '¿Estás seguro de eliminar este bloque?',
            content: 'Esta acción no se puede deshacer.',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await handleDeleteBlock(blockId);
                    message.success('Bloque eliminado exitosamente.');
                } catch (error) {
                    message.error('No se pudo eliminar el bloque.');
                }
            },
        });
    };

    const handleDeleteBlock = async (blockId) => {
        try {
            await request(`blocks/${blockId}`, "DELETE");
            changeModule(selectedModule); // recargar los bloques
        } catch (err) {
            throw new Error(err.message || "Error eliminando el bloque.");
        }
    };

    const handleSubmitBlock = async (values) => {
        values.module_id = selectedModule;
        try {
            await request('blocks', "POST", {
                ...values
            });
            message.success("Bloque creado exitosamente.");
            setIsBlockModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error("No se pudo crear el bloque.");
        }
    };

    const handleAddField = (blockId) => {
        setCurrentBlockId(blockId);
        setIsFieldModalOpen(true);
        fieldForm.resetFields();
    };

    const handleSubmitField = async (values) => {
        try {
            const payload = {
                ...values,
                block_id: currentBlockId
            };
            
            await request("fields", "POST", payload);
            message.success("Campo creado exitosamente.");
            setIsFieldModalOpen(false);
            setCurrentBlockId(null);
            changeModule(selectedModule); // recarga los datos
        } catch (err) {
            message.error(err.message || "Error al crear el campo.");
        }
    };

    const handleConfirmDeleteField = async (fieldId) => {
        confirm({
            title: 'Are you sure you want to delete this field?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await handleDelete(fieldId); // Llama a tu función de eliminación
                    message.success('Field deleted successfully!');
                } catch (error) {
                    message.error('Failed to delete the Field. Please try again.');
                }
            },
        });
    };

    const handleDelete = async (fieldId) => {
        try {
            await request(`fields/${fieldId}`, "DELETE");
            message.success("Campo eliminado.");
            changeModule(selectedModule);
        } catch (err) {
            message.error("No se pudo eliminar el campo.");
        }
    };

    const fieldTypes = [
        { value: "text", label: "Texto" },
        { value: "number", label: "Número" },
        { value: "select", label: "Selección" },
        { value: "date", label: "Fecha" },
        { value: "checkbox", label: "Checkbox" },
        { value: "image", label: "Imagen" },
        { value: "textarea", label: "Textarea" }
    ];

    return (
        <>
            <FormHeader title="Custom Fields" subtitle="Define and manage custom fields dynamically." />

            <Form.Item
                label="Modulo"
                style={{ marginBottom: '10px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', marginRight: '20px', width: '100%' }}
            >
                {loading ? (
                    <Skeleton.Input active style={{ width: 200 }} />
                ) : (
                    <Space>
                        <Select
                            placeholder="Select a module"
                            style={{ width: '200px' }}
                            onChange={changeModule}
                            value={selectedModule}
                        >
                            {modules.map(module => (
                                <Select.Option key={module.id} value={module.id}>{module.name}</Select.Option>
                            ))}
                        </Select>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBlock}>Agregar bloque</Button>
                    </Space>
                )}
            </Form.Item>

            <Divider />

            {blocks.length > 0 ? (
                blocks.map(block => (
                    <FieldCard
                        key={block.block_id}
                        block={block}
                        onEdit={showModal}
                        onAddField={handleAddField}
                        onDeleteField={handleConfirmDeleteField}
                        onDeleteBlock={handleConfirmDeleteBlock}
                    />
                ))
            ) : (
                !loading && <Empty description="No fields available" />
            )}

            <Modal
                title={editField?.name || ""}
                open={isModalOpen}
                width={350}
                footer={[]}
                destroyOnClose
                onCancel={handleCancel}
            >
                <Divider style={{ margin: '12px 0' }} />
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    style={{ backgroundColor: "#fff", borderRadius: "8px" }}
                >
                    <Row>
                        <Col span={24}>Type: {editField?.type}</Col>
                    </Row>

                    <Divider style={{ margin: '12px 0' }} />

                    <Form.Item
                        label="Required"
                        name="required"
                        valuePropName="checked"
                        style={{ marginBottom: '10px' }}
                    >
                        <Checkbox />
                    </Form.Item>

                    <Form.Item
                        label="Read only"
                        name="readonly"
                        valuePropName="checked"
                        style={{ marginBottom: '10px' }}
                    >
                        <Checkbox />
                    </Form.Item>

                    <Form.Item
                        label="Hidden"
                        name="hidden"
                        valuePropName="checked"
                        style={{ marginBottom: '10px' }}
                    >
                        <Checkbox />
                    </Form.Item>

                    <Form.Item
                        label="Visible"
                        name="visible"
                        valuePropName="checked"
                        style={{ marginBottom: '10px' }}
                    >
                        <Checkbox />
                    </Form.Item>

                    <Form.Item
                        label="Label"
                        name="label"
                        rules={[{ required: true, message: "Label is required" }]}
                        style={{ marginBottom: '10px' }}
                    >
                        <Input placeholder='Label' />
                    </Form.Item>

                    <Form.Item label="Helper text" name="helper_text" style={{ marginBottom: '10px' }}>
                        <Input placeholder='Helper text' />
                    </Form.Item>

                    <Form.Item label="Default value" name="default_value" style={{ marginBottom: '10px' }}>
                        <Input placeholder='Default value' />
                    </Form.Item>

                    <Form.Item label="Placeholder" name="placeholder" style={{ marginBottom: '10px' }}>
                        <Input placeholder='Placeholder' />
                    </Form.Item>

                    {editField?.type === 'select' && (
                        <Form.Item name="options" label="Options" style={{ marginBottom: '10px' }}>
                            <Input placeholder="Comma-separated values" />
                        </Form.Item>
                    )}

                    <FormFooter
                        onCancel={handleCancel}
                        onSave={() => form.submit()}
                    />
                </Form>
            </Modal>

            <Modal
                title="Nuevo bloque"
                open={isBlockModalOpen}
                onCancel={() => setIsBlockModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={blockForm}
                    onFinish={handleSubmitBlock}
                    layout="vertical"
                >
                    <Form.Item
                        label="Nombre del bloque"
                        name="name"
                        rules={[{ required: true, message: "El nombre es obligatorio" }]}
                    >
                        <Input placeholder="Ej. Información adicional" />
                    </Form.Item>

                    <Form.Item
                        label="Descripción"
                        name="description"
                        rules={[{ required: true, message: "La descripción es obligatoria" }]}
                    >
                        <Input placeholder="Ej. Información para el usuario" />
                    </Form.Item>

                    <FormFooter
                        onCancel={() => setIsBlockModalOpen(false)}
                        onSave={() => blockForm.submit()}
                    />
                </Form>
            </Modal>

            <Modal
                title="Nuevo campo"
                open={isFieldModalOpen}
                onCancel={() => {
                    setIsFieldModalOpen(false);
                    setCurrentBlockId(null);
                }}
                width={550}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={fieldForm}
                    onFinish={handleSubmitField}
                    layout="vertical"
                    initialValues={{
                        visible: true,
                        editable: true,
                    }}
                >
                    <Form.Item
                        label="Nombre"
                        name="name"
                        rules={[{ required: true, message: "El nombre es obligatorio" }]}
                    >
                        <Input placeholder="Ej. nombre" />
                    </Form.Item>

                    <Form.Item
                        label="Etiqueta"
                        name="label"
                        rules={[{ required: true, message: "La etiqueta es obligatoria" }]}
                    >
                        <Input placeholder="Ej. Nombre completo" />
                    </Form.Item>

                    <Form.Item
                        label="Placeholder"
                        name="placeholder"
                        rules={[{ required: true, message: "El placeholder es obligatorio" }]}
                    >
                        <Input placeholder="Ej. Ingresa tu nombre" />
                    </Form.Item>

                    <Form.Item
                        label="Tipo de campo"
                        name="type"
                        rules={[{ required: true, message: "El tipo es obligatorio" }]}
                    >
                        <Select
                            onChange={(value) => setFieldType(value)}
                            placeholder="Selecciona tipo de campo"
                        >
                            {fieldTypes.map(t => (
                                <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {fieldType === "select" && (
                        <Form.Item label="Opciones" name="options">
                            <Input placeholder="Ej. rojo,verde,azul" />
                        </Form.Item>
                    )}

                    <Space flex="auto">
                        <Form.Item name="required" valuePropName="checked">
                            <Checkbox>Requerido</Checkbox>
                        </Form.Item>

                        <Form.Item name="visible" valuePropName="checked">
                            <Checkbox>Visible</Checkbox>
                        </Form.Item>

                        <Form.Item name="editable" valuePropName="checked">
                            <Checkbox>Editable</Checkbox>
                        </Form.Item>

                        <Form.Item name="readonly" valuePropName="checked">
                            <Checkbox>Solo lectura</Checkbox>
                        </Form.Item>

                        <Form.Item name="hidden" valuePropName="checked">
                            <Checkbox>Oculto</Checkbox>
                        </Form.Item>
                    </Space>

                    <Form.Item label="Helper text" name="helper_text">
                        <Input placeholder="Ej. Coloca tu nombre completo" />
                    </Form.Item>

                    <Form.Item label="Valor por defecto" name="default_value">
                        <Input placeholder="Ej. Juan Pérez" />
                    </Form.Item>

                    <FormFooter
                        onCancel={() => {
                            setIsFieldModalOpen(false);
                            setCurrentBlockId(null);
                        }}
                        onSave={() => fieldForm.submit()}
                    />
                </Form>
            </Modal>
        </>
    );
};

export default CustomFields;
