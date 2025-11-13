// components/BaseCrudView.jsx
import React, { useEffect, useState } from "react";
import { message, Modal, Form, Breadcrumb, Select, Space } from "antd";
import DataTable from "./DataTable";
import PaginationControl from "./PaginationControl";
import SearchFilter from "./SearchFilter";
import FormSection from "./FormSection";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import dayjs from "dayjs";
import useFetch from "../../hooks/useFetch";

const BaseCrudView = ({
    endpoint,          // ej: 'classes'
    moduleFieldId,     // ej: 5 para cargar campos dinámicos
    columns,           // columnas para la tabla
    titleSingular,     // 'Clase'
    titlePlural,       // 'Clases'
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [moduleData, setModuleData] = useState(null);

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
            const moduleRes = await request(`fields/${moduleFieldId}`, 'GET');
            setModuleData(moduleRes?.module || { blocks: [] });

            if (id) {
                const itemData = await request(`${endpoint}/${id}`, 'GET');
                form.setFieldsValue({
                    ...itemData,
                    hour: itemData.hour ? dayjs(itemData.hour, "HH:mm") : null,
                });
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

    const handleSubmit = async (values) => {
        const transformedValues = {
            ...values,
            hour: values.hour
                ? new Date(values.hour).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
                : null,
        };

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
            <Breadcrumb style={{ marginBottom: 16 }}
                items={[
                    { title: 'Dashboard' },
                    { title: titlePlural },
                ]}
            />

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
                    onCreate={() => openModal()}
                    title={titleSingular}
                />
            </Space>

            <DataTable
                columns={columns}
                data={items}
                loading={loading}
                pagination={pagination}
                onEdit={(id) => openModal(id)}
                onDelete={handleDelete}
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
                {moduleData?.blocks?.length > 0 && (
                    <>
                        <FormHeader
                            title={editingId ? `Editar ${titleSingular}` : `Crear ${titleSingular}`}
                            subtitle={editingId ? `Edita los datos del ${titleSingular.toLowerCase()}` : `Completa los datos para crear un nuevo ${titleSingular.toLowerCase()}`}
                            onSave={() => form.submit()}
                            onCancel={closeModal}
                        />
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            style={{ padding: 20 }}
                        >
                            {moduleData.blocks.map(block => (
                                <FormSection key={block.block_id} title={block.block_name} fields={block.fields} />
                            ))}
                            <FormFooter onCancel={closeModal} onSave={() => form.submit()} />
                        </Form>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default BaseCrudView;
