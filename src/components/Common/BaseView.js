// components/BaseCrudView.jsx
import React, { useEffect, useState, useContext } from "react";

import { message, Modal, Form, Breadcrumb, Select, Space, Spin } from "antd";

import DataTable from "./DataTable";
import PaginationControl from "./PaginationControl";
import SearchFilter from "./SearchFilter";
import FormSection from "./FormSection";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import DrawerDetails from "./DrawerDetails";

import useFetch from "../../hooks/useFetch";
import { AuthContext } from "../../context/AuthContext";

import dayjs from "dayjs";

const BaseCrudView = ({
    breadcrumb = true, // mostrar breadcrumb
    endpoint,          // ej: 'classes'
    moduleFieldId,     // ej: 5 para cargar campos dinámicos
    columns,           // columnas para la tabla
    titleSingular,     // 'Clase'
    titlePlural,       // 'Clases'
    filters,           // filtros para la consulta
    fixedValues,       // valores fijos para la consulta
    hiddenFields,      // campos ocultos en el formulario
}) => {
    const { hasPermission } = useContext(AuthContext);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [moduleData, setModuleData] = useState(null);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [drawerData, setDrawerData] = useState(null); // Nuevo estado para los datos estructurados
    const [drawerLoading, setDrawerLoading] = useState(false); // Nuevo estado para el loading del drawer

    const { request } = useFetch();
    const [form] = Form.useForm();

    // --- Fetch items ---
    const fetchItems = async (page = pagination.current, limit = pagination.pageSize) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search.length >= 3 ? search : undefined,
                ...filters,
            };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
            ).toString();

            const data = await request(`${endpoint}/?${queryParams}`, "GET");

            setItems(data.data || []);
            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / limit));
            const current = page > lastPage ? lastPage : page;
            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error(`Error al cargar ${titlePlural}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailForDrawer = async (id) => {
        if (!id) return;
        
        // 1. Mostrar spinner y limpiar datos anteriores
        setDrawerLoading(true);
        setDrawerData(null);
        setDrawerVisible(true);
        
        try {
            // El backend ya devuelve el objeto estructurado (View Model: {title, sections, ...})
            const detailData = await request(`${endpoint}/${id}`, "GET");
            setDrawerData(detailData);
        } catch (error) {
            console.error("Error fetching detail:", error);
            message.error(`Error al cargar los detalles de ${titleSingular}`);
            setDrawerVisible(false); // Cierra si hay error
        } finally {
            setDrawerLoading(false);
        }
    };
    // --------------------------------------------------

    // --- Lógica del Drawer ---
    const handleRowClick = (record) => {
        setSelectedRecordId(record.id);
        fetchDetailForDrawer(record.id); // Lanza el fetch y abre el drawer
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
        setDrawerData(null);
        setSelectedRecordId(null);
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchItems(1), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handlePageChange = (newPage) => fetchItems(newPage);
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }));
        fetchItems(1, newSize);
    };

    // --- Delete ---
    const handleDelete = async (id) => {
        try {
            await request(`${endpoint}/${id}`, "DELETE");
            message.success(`${titleSingular} eliminad${titleSingular.endsWith('a') ? 'a' : 'o'} correctamente`);
            setItems(prev => prev.filter(i => i.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error(`Error al eliminar ${titleSingular}`);
        }
    };

    // --- Modal ---
    const openModal = async (id = null) => {
        setEditingId(id);
        setModalVisible(true);

        try {
            const moduleRes = await request(`fields/module/${moduleFieldId}`, 'GET');
            setModuleData(moduleRes?.module || { blocks: [] });

            if (id) {
                const itemData = await request(`${endpoint}/${id}`, 'GET');
                // Vaciar contraseña para no mostrar hash
                if ('password' in itemData) itemData.password = "";

                if (itemData.hour) {
                    itemData.hour = dayjs(itemData.hour, "HH:mm");
                }

                form.setFieldsValue(itemData);
            } else {
                form.resetFields();
            }
        } catch (err) {
            console.error(err);
            message.error("Error al cargar los campos dinámicos");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingId(null);
        setModuleData(null);
        fetchItems();
    };

    // --- Submit ---
    const handleSubmit = async (values) => {
        const transformedValues = { ...values, ...fixedValues, };

        if ('hour' in values && values.hour) {
            transformedValues.hour = new Date(values.hour).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        }

        if ('password' in transformedValues && !transformedValues.password) {
            delete transformedValues.password;
        }

        try {
            if (editingId) {
                await request(`${endpoint}/${editingId}`, 'PUT', transformedValues);
                message.success(`${titleSingular} actualizad${titleSingular.endsWith('a') ? 'a' : 'o'} correctamente`);
            } else {
                await request(`${endpoint}/`, 'POST', transformedValues);
                message.success(`${titleSingular} cread${titleSingular.endsWith('a') ? 'a' : 'o'} correctamente`);
            }
            closeModal();
        } catch (error) {
            if (error.errors) {
                const fieldsWithErrors = error.errors.map(err => ({
                    name: err.field,
                    errors: [err.message]
                }));
                form.setFields(fieldsWithErrors);
            } else {
                message.error(error?.message || `Error al guardar ${titleSingular}`);
            }
        }
    };

    return (
        <div>
            {breadcrumb && (
                <Breadcrumb style={{ marginBottom: 16 }}
                    items={[
                        { title: 'Dashboard' },
                        { title: titlePlural },
                    ]}
                />
            )}

            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
                <Select
                    value={pagination.pageSize}
                    style={{ width: 120 }}
                    onChange={handlePageSizeChange}
                    options={[
                        { value: 5, label: '5 / page' },
                        { value: 10, label: '10 / page' },
                        { value: 20, label: '20 / page' },
                        { value: 50, label: '50 / page' },
                        { value: 100, label: '100 / page' },
                    ]}
                />
                <SearchFilter
                    search={search}
                    setSearch={setSearch}
                    canCreate={hasPermission(`${endpoint}:create`)}
                    onCreate={() => openModal()}
                    title={titleSingular}
                />
            </Space>

            <DataTable
                columns={columns}
                data={items}
                loading={loading}
                pagination={pagination}
                onEdit={hasPermission(`${endpoint}:edit`) ? (record) => openModal(record.id) : undefined}
                onDelete={hasPermission(`${endpoint}:delete`) ? (id) => handleDelete(id) : undefined}
                disableEdit={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                disableDelete={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedRecordId(record.id);
                        handleRowClick(record);
                    },
                    style: { cursor: 'pointer' }
                })}
                selectedRowId={selectedRecordId}
            />

            <PaginationControl
                page={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
            />

            <Modal
                open={modalVisible}
                title={null}
                footer={null}
                width={800}
                onCancel={closeModal}
                destroyOnClose
            >
                {moduleData ? (
                    moduleData.blocks?.length > 0 ? (
                        <>
                            <FormHeader
                                title={editingId ? `Editar ${titleSingular}` : `Crear ${titleSingular}`}
                                subtitle={
                                    editingId
                                        ? `Edita los datos del ${titleSingular.toLowerCase()}`
                                        : `Completa los datos para crear un nuevo ${titleSingular.toLowerCase()}`
                                }
                                onSave={() => form.submit()}
                                onCancel={closeModal}
                            />
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                style={{ padding: "0 10px" }}
                            >
                                {moduleData.blocks.map((block) => (
                                    <FormSection
                                        key={block.block_id}
                                        title={block.block_name}
                                        fields={block.fields.filter(f => !hiddenFields?.includes(f.name))}
                                    />
                                ))}
                                <FormFooter onCancel={closeModal} onSave={() => form.submit()} />
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: 50 }}>
                            No hay campos para mostrar.
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: "center", padding: 50 }}>Cargando...</div>
                )}
            </Modal>

            <DrawerDetails
                visible={drawerVisible}
                onClose={handleDrawerClose}
                data={drawerLoading ? null : drawerData}
            >
                {drawerLoading && (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                )}
            </DrawerDetails>

        </div>
    );
};

export default BaseCrudView;
