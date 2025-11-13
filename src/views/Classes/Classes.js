import React, { useEffect, useState } from "react";
import { Breadcrumb, message, Modal, Form } from "antd";
import useFetch from "../../hooks/useFetch";
import SearchFilter from "../../components/Common/SearchFilter";
import DataTable from "../../components/Common/DataTable";
import PaginationControl from "../../components/Common/PaginationControl";
import FormSection from "../../components/Common/FormSection";
import FormFooter from "../../components/Common/FormFooter";
import FormHeader from "../../components/Common/FormHeader";
import dayjs from "dayjs";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 2, total: 0 });

    const [modalVisible, setModalVisible] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);
    const [moduleData, setModuleData] = useState(null);

    const { request } = useFetch();
    const [form] = Form.useForm();

    // --- Fetch clases ---
    const fetchClasses = async (page = pagination.current) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pagination.pageSize,
                search: search.length >= 3 ? search : undefined,
            };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
            ).toString();

            const data = await request(`classes/?${queryParams}`, "GET");

            setClasses(data.data || []);
            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / pagination.pageSize));
            const current = page > lastPage ? lastPage : page;
            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error("Error al cargar las clases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchClasses(1), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handlePageChange = (newPage) => fetchClasses(newPage);

    // --- Eliminar clase ---
    const handleDelete = async (id) => {
        try {
            await request(`classes/${id}`, "DELETE");
            message.success("Clase eliminada correctamente");
            setClasses(prev => prev.filter(cls => cls.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error("Error al eliminar la clase");
        }
    };

    // --- Modal ---
    const openModal = async (id = null) => {
        setEditingClassId(id);
        setModalVisible(true);

        try {
            const moduleRes = await request('fields/5', 'GET'); // datos del módulo
            setModuleData(moduleRes?.module || { blocks: [] });

            if (id) {
                const classData = await request(`classes/${id}`, 'GET');
                form.setFieldsValue({
                    ...classData,
                    hour: classData.hour ? dayjs(classData.hour, "HH:mm") : null,
                });
            } else {
                form.resetFields();
            }
        } catch (err) {
            console.error(err);
            message.error("Error al cargar el módulo de campos");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingClassId(null);
        setModuleData(null);
        fetchClasses();
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
            if (editingClassId) {
                await request(`classes/${editingClassId}`, 'PUT', transformedValues);
                message.success("Clase actualizada correctamente");
            } else {
                await request('classes/', 'POST', transformedValues);
                message.success("Clase creada correctamente");
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
                message.error(error?.message || 'Error al guardar la clase');
            }
        }
    };

    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name", sorter: true },
        { title: "Nivel", dataIndex: "level", key: "level" },
        { title: "Género", dataIndex: "genre", key: "genre" },
        { title: "Días de clase", dataIndex: "date", key: "date" },
        { title: "Horas de clase", dataIndex: "hour", key: "hour" },
    ];

    return (
        <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item>Clases</Breadcrumb.Item>
            </Breadcrumb>

            <SearchFilter
                search={search}
                setSearch={setSearch}
                onCreate={() => openModal()}
                title="Clase"
            />

            <DataTable
                columns={columns}
                data={classes}
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
                {moduleData && moduleData.blocks && moduleData.blocks.length > 0 && (
                    <>
                        <FormHeader
                            title={editingClassId ? "Editar Clase" : "Crear Clase"}
                            subtitle={editingClassId ? "Edita los datos de la clase" : "Completa los datos para crear una nueva clase"}
                            onSave={() => form.submit()}
                            onCancel={closeModal}
                        />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            style={{padding:20}}
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

export default Classes;
