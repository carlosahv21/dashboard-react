import React, { useState, useEffect, useContext, useCallback } from "react";
import { Divider, Form, Select, Card, Row, Col, Button, Modal, Checkbox, Input, Skeleton, Empty, Space, Tooltip, theme, App } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import { AuthContext } from "../../../context/AuthContext"; // <--- IMPORTANTE

// -----------------------------------------------------------
// FIELD CARD → Ahora con permisos del AuthContext
// -----------------------------------------------------------
const FieldCard = ({ block, onEdit, onAddField, onDeleteField, onDeleteBlock }) => {

    const { hasPermission } = useContext(AuthContext);
    const { token } = theme.useToken();

    const canCreateField = hasPermission("fields:create");
    const canDeleteBlock = hasPermission("blocks:delete");
    const canEditField = hasPermission("fields:edit");
    const canDeleteField = hasPermission("fields:delete");

    const isInheritedBlock = block.inherited;

    return (
        <Card
            style={{ marginBottom: "10px", backgroundColor: token.colorBgContainer }}
            type="inner"
            title={
                <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Space>{block.block_name}</Space>

                    <Space>

                        {/* Agregar campo */}
                        {canCreateField && (
                            <Tooltip title={isInheritedBlock ? "No se puede agregar campo a bloque heredado" : "Agregar campo"}>
                                <Button
                                    size="small"
                                    type="text"
                                    icon={<PlusOutlined />}
                                    onClick={() => !isInheritedBlock && onAddField(block.block_id)}
                                    disabled={isInheritedBlock}
                                />
                            </Tooltip>
                        )}

                        {/* Eliminar bloque */}
                        {canDeleteBlock && (
                            <Tooltip title={isInheritedBlock ? "No se puede eliminar bloque heredado" : "Eliminar bloque"}>
                                <Button
                                    size="small"
                                    type="link"
                                    danger
                                    onClick={() => !isInheritedBlock && onDeleteBlock(block.block_id)}
                                    icon={<DeleteOutlined />}
                                    disabled={isInheritedBlock}
                                />
                            </Tooltip>
                        )}
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
                            marginTop: "10px",
                            marginBottom: "10px",
                            backgroundColor: token.colorFillAlter, // Use 'colorFillAlter' or similar for light gray replacement
                            padding: "10px",
                            borderRadius: "4px"
                        }}
                    >
                        <Space>
                            <span style={{ color: token.colorText }}>
                                {field.label}
                                {field.required === 1 && <span style={{ color: "red" }}> *</span>}
                            </span>

                            {/* Editar campo */}
                            {canEditField && (
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => !field.inherited && onEdit(field)}
                                    disabled={field.inherited}
                                />
                            )}

                            {/* Eliminar campo */}
                            {canDeleteField && (
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => !field.inherited && onDeleteField(field.field_id)}
                                    disabled={field.inherited}
                                />
                            )}
                        </Space>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

const CustomFields = () => {
    const { request } = useFetch();

    // -----------------------------------------------------------
    // Traer permisos del AuthContext
    // -----------------------------------------------------------
    const { hasPermission } = useContext(AuthContext);

    const canCreateBlock = hasPermission("blocks:create");

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

    const { message, modal } = App.useApp();

    const changeModule = useCallback(async (value) => {
        setSelectedModule(value);
        setLoading(true);
        try {
            const dataFields = await request(`fields/module/${value}`, "GET");
            setBlocks(dataFields?.data?.blocks || []);
        } catch (err) {
            message.error(err.message || "Error al cargar campos.");
        } finally {
            setLoading(false);
        }
    }, [request, message]);

    useEffect(() => {
        const fetchFields = async () => {
            setLoading(true);
            try {
                const response = await request("modules?has_custom_fields=true", "GET");
                const modulesWithFields = response.data.filter(m => m.has_custom_fields);
                setModules(modulesWithFields);

                if (modulesWithFields.length > 0) {
                    await changeModule(modulesWithFields[0].id);
                }
            } catch (err) {
                message.error(err.message || "Error al cargar módulos.");
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [request, changeModule]);



    // Edit field
    const showModal = (field) => {
        form.setFieldsValue({ ...field });
        setEditField(field);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values, id: editField.field_id, module_id: selectedModule };
            await request(`fields/${editField.field_id}`, "PUT", payload);
            message.success("Campo actualizado.");
            setIsModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error(err.message || "Error al actualizar campo.");
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setEditField(null);
        setIsModalOpen(false);
    };

    // Bloques
    const handleAddBlock = () => {
        setIsBlockModalOpen(true);
        blockForm.resetFields();
    };

    const handleConfirmDeleteBlock = async (blockId) => {
        modal.confirm({
            title: "¿Eliminar bloque?",
            content: "Esta acción no se puede deshacer.",
            okText: "Sí",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await handleDeleteBlock(blockId);
                    message.success("Bloque eliminado.");
                } catch (error) {
                    message.error("No se pudo eliminar el bloque.");
                }
            }
        });
    };

    const handleDeleteBlock = async (blockId) => {
        try {
            await request(`blocks/${blockId}`, "DELETE");
            changeModule(selectedModule);
        } catch (err) {
            throw new Error(err.message || "Error eliminando bloque.");
        }
    };

    const handleSubmitBlock = async (values) => {
        values.module_id = selectedModule;
        try {
            await request("blocks", "POST", {
                ...values
            });
            message.success("Bloque creado.");
            setIsBlockModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error("No se pudo crear el bloque.");
        }
    };

    // Campos
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
            message.success("Campo creado.");
            setIsFieldModalOpen(false);
            setCurrentBlockId(null);
            changeModule(selectedModule);
        } catch (err) {
            message.error(err.message || "Error al crear campo.");
        }
    };

    const handleConfirmDeleteField = async (fieldId) => {
        modal.confirm({
            title: "¿Eliminar campo?",
            content: "Esta acción no se puede deshacer.",
            okText: "Sí",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await handleDelete(fieldId);
                    message.success("Campo eliminado.");
                } catch (error) {
                    message.error("No se pudo eliminar el campo.");
                }
            }
        });
    };

    const handleDelete = async (fieldId) => {
        try {
            await request(`fields/${fieldId}`, "DELETE");
            changeModule(selectedModule);
        } catch (err) {
            message.error("No se pudo eliminar el campo.");
        }
    };

    return (
        <>
            <FormHeader
                title="Campos personalizados"
                subtitle="Define y gestiona campos personalizados dinámicamente."
            />

            <Form.Item
                label="Modulo"
                style={{
                    marginBottom: "10px",
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    marginRight: "20px",
                    width: "100%"
                }}
            >
                {loading ? (
                    <Skeleton.Input active style={{ width: 200 }} />
                ) : (
                    <Space>
                        <Select
                            placeholder="Select a module"
                            style={{ width: "200px" }}
                            onChange={changeModule}
                            value={selectedModule}
                        >
                            {modules.map(module => (
                                <Select.Option key={module.id} value={module.id}>
                                    {module.name}
                                </Select.Option>
                            ))}
                        </Select>

                        {/* Crear bloque */}
                        {canCreateBlock && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddBlock}
                            >
                                Agregar bloque
                            </Button>
                        )}
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

            {/* MODALS — sin cambios excepto permisos ya aplicados arriba */}
            {/* Edit field */}
            <Modal
                title={editField?.name || ""}
                open={isModalOpen}
                width={350}
                footer={[]}
                destroyOnClose
                onCancel={handleCancel}
            >
                <Divider style={{ margin: "12px 0" }} />

                <Form form={form} onFinish={handleSubmit}>
                    <Row>
                        <Col span={24}>Type: {editField?.type}</Col>
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    <Form.Item label="Required" name="required" valuePropName="checked">
                        <Checkbox />
                    </Form.Item>

                    <Form.Item
                        label="Label"
                        name="label"
                        rules={[{ required: true, message: "Label is required" }]}
                    >
                        <Input placeholder="Label" />
                    </Form.Item>

                    {editField?.type === "select" && (
                        <Form.Item name="options" label="Options">
                            <Input placeholder="Comma-separated values" />
                        </Form.Item>
                    )}

                    <FormFooter onCancel={handleCancel} onSave={() => form.submit()} />
                </Form>
            </Modal>

            {/* Crear bloque */}
            <Modal
                title="Nuevo bloque"
                open={isBlockModalOpen}
                onCancel={() => setIsBlockModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={blockForm} onFinish={handleSubmitBlock} layout="vertical">
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

            {/* Crear campo */}
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
                <Form form={fieldForm} onFinish={handleSubmitField} layout="vertical">
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
                        label="Tipo de campo"
                        name="type"
                        rules={[{ required: true, message: "El tipo es obligatorio" }]}
                    >
                        <Select
                            onChange={value => setFieldType(value)}
                            placeholder="Selecciona tipo de campo"
                        >
                            {[
                                { value: "text", label: "Texto" },
                                { value: "number", label: "Número" },
                                { value: "select", label: "Selección" },
                                { value: "date", label: "Fecha" },
                                { value: "time", label: "Hora" },
                                { value: "checkbox", label: "Checkbox" },
                                { value: "image", label: "Imagen" },
                                { value: "textarea", label: "Textarea" }
                            ].map(t => (
                                <Select.Option key={t.value} value={t.value}>
                                    {t.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {fieldType === "select" && (
                        <Form.Item name="options" label="Opciones">
                            <Input placeholder="rojo,verde,azul" />
                        </Form.Item>
                    )}

                    <Form.Item name="required" valuePropName="checked">
                        <Checkbox>Required</Checkbox>
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
