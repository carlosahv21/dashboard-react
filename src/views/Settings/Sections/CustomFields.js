import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Divider, Form, Select, Card, Row, Col, Button, Modal, Checkbox, Input, Skeleton, Empty, Space, Tooltip, theme, App } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import { AuthContext } from "../../../context/AuthContext"; // <--- IMPORTANTE
import { useTranslation } from "react-i18next";

// -----------------------------------------------------------
// FIELD CARD → Ahora con permisos del AuthContext
// -----------------------------------------------------------
const FieldCard = ({ block, onEdit, onAddField, onDeleteField, onDeleteBlock }) => {
    const { t } = useTranslation();
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
                            <Tooltip title={isInheritedBlock ? t('settings.cannotAddFieldInherited') : t('settings.addField')}>
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
                            <Tooltip title={isInheritedBlock ? t('settings.cannotDeleteBlockInherited') : t('settings.deleteBlock')}>
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
                                    onClick={() => !field.inherited && onEdit(field, block.block_id)}
                                    disabled={field.inherited}
                                />
                            )}

                            {/* Eliminar campo */}
                            {canDeleteField && (
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => !field.inherited && field.type !== 'relation' && onDeleteField(field.field_id)}
                                    disabled={field.inherited || field.type === 'relation'}
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
    const { t } = useTranslation();
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
            message.error(err.message || t('settings.loadFieldsError'));
        } finally {
            setLoading(false);
        }
    }, [request, message, t]);

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
                message.error(err.message || t('settings.loadModulesError'));
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [request, changeModule, t]);

    // Edit field
    const showModal = (field, blockId) => {
        let formattedField = { ...field };
        // Ensure options are an array for the Select tags mode
        if (field.type === 'select' && field.options && typeof field.options === 'string') {
            try {
                // Try parsing if it looks like JSON array
                if (field.options.startsWith('[')) {
                    formattedField.options = JSON.parse(field.options);
                } else {
                    // Otherwise split by comma
                    formattedField.options = field.options.split(',').map(op => op.trim());
                }
            } catch (e) {
                formattedField.options = [];
            }
        }

        form.setFieldsValue(formattedField);
        setEditField(field);
        setCurrentBlockId(blockId);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            // Options are already an array from Select mode="tags"
            const payload = { ...values, id: editField.field_id, block_id: currentBlockId };
            await request(`fields/${editField.field_id}`, "PUT", payload);
            message.success(t('settings.fieldUpdated'));
            setIsModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error(err.message || t('settings.updateFieldError'));
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
            title: t('settings.deleteBlockConfirmTitle'),
            content: t('global.deleteConfirm'),
            okText: t('global.yes'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: async () => {
                try {
                    await handleDeleteBlock(blockId);
                    message.success(t('settings.blockDeleted'));
                } catch (error) {
                    message.error(t('settings.deleteBlockError'));
                }
            }
        });
    };

    const handleDeleteBlock = async (blockId) => {
        try {
            await request(`blocks/${blockId}`, "DELETE");
            changeModule(selectedModule);
        } catch (err) {
            throw new Error(err.message || t('settings.deleteBlockError'));
        }
    };

    const handleSubmitBlock = async (values) => {
        values.module_id = selectedModule;
        try {
            await request("blocks", "POST", {
                ...values
            });
            message.success(t('settings.blockCreated'));
            setIsBlockModalOpen(false);
            changeModule(selectedModule);
        } catch (err) {
            message.error(t('settings.createBlockError'));
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
            message.success(t('settings.fieldCreated'));
            setIsFieldModalOpen(false);
            setCurrentBlockId(null);
            changeModule(selectedModule);
        } catch (err) {
            message.error(err.message || t('settings.createFieldError'));
        }
    };

    const handleConfirmDeleteField = async (fieldId) => {
        modal.confirm({
            title: t('settings.deleteFieldConfirmTitle'),
            content: t('global.deleteConfirm'),
            okText: t('global.yes'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: async () => {
                try {
                    await handleDelete(fieldId);
                    message.success(t('settings.fieldDeleted'));
                } catch (error) {
                    message.error(t('settings.deleteFieldError'));
                }
            }
        });
    };

    const handleDelete = async (fieldId) => {
        try {
            await request(`fields/${fieldId}`, "DELETE");
            changeModule(selectedModule);
        } catch (err) {
            message.error(t('settings.deleteFieldError'));
        }
    };

    const fieldTypes = useMemo(() => [
        { value: "text", label: t('settings.fieldTypeText') },
        { value: "number", label: t('settings.fieldTypeNumber') },
        { value: "select", label: t('settings.fieldTypeSelect') },
        { value: "date", label: t('settings.fieldTypeDate') },
        { value: "time", label: t('settings.fieldTypeTime') },
        { value: "checkbox", label: t('settings.fieldTypeCheckbox') },
        { value: "image", label: t('settings.fieldTypeImage') },
        { value: "textarea", label: t('settings.fieldTypeTextarea') }
    ], [t]);

    return (
        <>
            <FormHeader
                title={t('settings.customFieldsTitle')}
                subtitle={t('settings.customFieldsSubtitle')}
            />

            <Form.Item
                label={t('settings.moduleLabel')}
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
                            placeholder={t('settings.selectModulePlaceholder')}
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
                                {t('settings.addBlock')}
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
                !loading && <Empty description={t('global.noData')} />
            )}

            {/* MODALS — sin cambios excepto permisos ya aplicados arriba */}
            {/* Edit field */}
            <Modal
                title={editField?.name || ""}
                open={isModalOpen}
                width={450}
                footer={[]}
                onCancel={handleCancel}
            >
                <Divider style={{ margin: "12px 0" }} />

                <Form form={form} onFinish={handleSubmit}>
                    <Row>
                        <Col span={24}>{t('settings.typeLabel')}: {editField?.type}</Col>
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    <Form.Item
                        label={
                            <Space>
                                {t('settings.requiredLabel')}
                                <Tooltip title={t('settings.requiredTooltip')}>
                                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                </Tooltip>
                            </Space>
                        }
                        name="required"
                        valuePropName="checked"
                    >
                        <Checkbox disabled={editField?.type === 'relation'} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <Space>
                                {t('settings.fieldLabel')}
                                <Tooltip title={t('settings.fieldLabelTooltip')}>
                                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                </Tooltip>
                            </Space>
                        }
                        name="label"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Input placeholder={t('settings.fieldLabel')} />
                    </Form.Item>

                    {editField?.type === "select" && (
                        <Form.Item
                            name="options"
                            label={
                                <Space>
                                    {t('settings.optionsLabel')}
                                    <Tooltip title={t('settings.optionsTooltip')}>
                                        <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                    </Tooltip>
                                </Space>
                            }
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder={t('settings.optionsPlaceholder')}
                                tokenSeparators={[',']}
                                open={false}
                            />
                        </Form.Item>
                    )}

                    <FormFooter onCancel={handleCancel} onSave={() => form.submit()} />
                </Form>
            </Modal>

            {/* Crear bloque */}
            <Modal
                title={t('settings.newBlockTitle')}
                open={isBlockModalOpen}
                onCancel={() => setIsBlockModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={blockForm} onFinish={handleSubmitBlock} layout="vertical">
                    <Form.Item
                        label={t('settings.blockNameLabel')}
                        name="name"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Input placeholder={t('settings.blockNamePlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('settings.descriptionLabel')}
                        name="description"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Input placeholder={t('settings.blockDescriptionPlaceholder')} />
                    </Form.Item>

                    <FormFooter
                        onCancel={() => setIsBlockModalOpen(false)}
                        onSave={() => blockForm.submit()}
                    />
                </Form>
            </Modal>

            {/* Crear campo */}
            <Modal
                title={t('settings.newFieldTitle')}
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
                        label={t('settings.fieldNameLabel')}
                        name="name"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Input placeholder={t('settings.fieldNamePlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <Space>
                                {t('settings.fieldLabel')}
                                <Tooltip title={t('settings.fieldLabelTooltip')}>
                                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                </Tooltip>
                            </Space>
                        }
                        name="label"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Input placeholder={t('settings.fieldLabelPlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('settings.fieldTypeLabel')}
                        name="type"
                        rules={[{ required: true, message: t('forms.requiredField') }]}
                    >
                        <Select
                            onChange={value => setFieldType(value)}
                            placeholder={t('settings.fieldTypePlaceholder')}
                        >
                            {fieldTypes.map(t => (
                                <Select.Option key={t.value} value={t.value}>
                                    {t.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {fieldType === "select" && (
                        <Form.Item
                            name="options"
                            label={
                                <Space>
                                    {t('settings.optionsLabel')}
                                    <Tooltip title={t('settings.optionsTooltip')}>
                                        <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                    </Tooltip>
                                </Space>
                            }
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder={t('settings.optionsPlaceholder')}
                                tokenSeparators={[',']}
                                open={false}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="required"
                        valuePropName="checked"
                        label={
                            <Space>
                                {t('settings.requiredLabel')}
                                <Tooltip title={t('settings.requiredTooltip')}>
                                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
                                </Tooltip>
                            </Space>
                        }
                    >
                        <Checkbox />
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
