import React, { useContext } from "react";
import { App, Card, Col, Row, Avatar, Form, Modal, Spin, Empty } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined, UserOutlined, HistoryOutlined } from "@ant-design/icons";
import { utils, writeFileXLSX } from "xlsx";

import { useCrud } from "../../hooks/useCrud";
import { useFormModal } from "../../hooks/useFormModal";
import { useDrawerDetail } from "../../hooks/useDrawerDetail";
import { AuthContext } from "../../context/AuthContext";

import SearchFilter from "../../components/Common/SearchFilter";
import PaginationControl from "../../components/Common/PaginationControl";
import DrawerDetails from "../../components/Common/DrawerDetails";
import FormHeader from "../../components/Common/FormHeader";
import FormSection from "../../components/Common/FormSection";
import FormFooter from "../../components/Common/FormFooter";

const { Meta } = Card;

const Students = () => {
    const endpoint = "students";
    const titleSingular = "Estudiante";
    const titlePlural = "Estudiantes";
    const moduleFieldId = 14;
    const hiddenFields = ["role_id"];

    const { hasPermission } = useContext(AuthContext);
    const { message, modal } = App.useApp();
    const [form] = Form.useForm();

    const initialSort = { field: "first_name", order: "ascend" };

    const {
        items, search, setSearch, pagination, fetchItems,
        handlePageChange, handlePageSizeChange, setItems, setPagination, request,
        selectedKeys, setSelectedKeys, isAllSelected, handleSelectAll, getAllItems
    } = useCrud(endpoint, titlePlural, { role_id: "2" }, initialSort);

    console.log(items);
    const {
        modalVisible, editingId, moduleData,
        openModal, closeModal, handleSubmit
    } = useFormModal(request, endpoint, moduleFieldId, titleSingular, { role_id: "2" }, form);

    const {
        drawerVisible, drawerData, drawerLoading,
        handleRowClick, handleDrawerClose
    } = useDrawerDetail(request, endpoint, titleSingular);

    const handleDelete = (id) => {
        modal.confirm({
            title: `¿Eliminar ${titleSingular.toLowerCase()}?`,
            content: "Esta acción no se puede deshacer.",
            okText: "Sí, eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: async () => {
                try {
                    await request(`${endpoint}/${id}`, "DELETE");
                    message.success(`${titleSingular} eliminad${titleSingular.endsWith('a') ? 'a' : 'o'} correctamente`);
                    setItems(prev => prev.filter(i => i.id !== id));
                    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
                } catch (error) {
                    message.error(error?.message || `Error al eliminar ${titleSingular}`);
                }
            }
        });
    };

    // Bulk delete could be tricky without checkboxes on cards, but we keep the logic if we want to add selection later
    const handleBulkDelete = () => {
        if (selectedKeys.length === 0) {
            message.warning(`Debe seleccionar al menos un registro para eliminar`);
            return;
        }

        modal.confirm({
            title: `¿Eliminar ${isAllSelected ? "todos los" : selectedKeys.length} registros?`,
            content: `Esta acción no se puede deshacer. Se eliminán ${isAllSelected ? pagination.total : selectedKeys.length} registros.`,
            okText: "Sí, eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: async () => {
                const hide = message.loading("Eliminando registros...", 0);
                try {
                    let idsToDelete = selectedKeys;
                    if (isAllSelected) {
                        const allItems = await getAllItems();
                        idsToDelete = allItems.map(i => i.id);
                    }

                    for (let i = 0; i < idsToDelete.length; i += 5) {
                        const chunk = idsToDelete.slice(i, i + 5);
                        await Promise.all(chunk.map(id => request(`${endpoint}/${id}`, "DELETE")));
                    }

                    message.success("Registros eliminados correctamente");
                    fetchItems();
                    setSelectedKeys([]);
                    handleSelectAll(false);
                } catch (error) {
                    console.error(error);
                    message.error("Error al eliminar registros masivamente");
                } finally {
                    hide();
                }
            }
        });
    };

    const handleFormSubmit = async (values) => {
        const shouldRefetch = await handleSubmit(values);
        if (shouldRefetch) {
            fetchItems();
        }
    };

    const handleCloseModal = () => {
        closeModal();
        fetchItems();
    };

    const handleExport = async () => {
        try {
            const allData = await getAllItems();
            exportToExcel(allData, titlePlural);
        } catch (e) {
            message.error("Error al exportar");
        }
    };

    const exportToExcel = (data, title) => {
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, title);
        writeFileXLSX(wb, `${title}.xlsx`);
    };

    return (
        <div style={{ padding: 20 }}>
            <SearchFilter
                search={search}
                setSearch={setSearch}
                canCreate={hasPermission(`${endpoint}:create`)}
                canDelete={false}
                onCreate={() => openModal()}
                title={titleSingular}
                titlePlural={titlePlural}
                pageSize={pagination.pageSize}
                onPageSizeChange={handlePageSizeChange}
                onExport={handleExport}
                onBulkDelete={handleBulkDelete}
            />

            <Row gutter={[16, 16]}>
                {items.length === 0 && (
                    <Col xs={24}>
                        <Empty />
                    </Col>
                )}
                {items.map((record) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={record.id}>
                        <Card
                            title={`${record.first_name} ${record.last_name}`}
                            extra={<EyeOutlined key="view" style={{ color: "#1668dc" }} onClick={() => handleRowClick(record)} />}
                            actions={[
                                <HistoryOutlined key="history" style={{ color: "#bfbfbf" }} onClick={() => console.log("Redirect to payment history")} />,
                                hasPermission(`${endpoint}:edit`) && <EditOutlined key="edit" style={{ color: "#13a8a8" }} onClick={() => openModal(record.id)} />,
                                hasPermission(`${endpoint}:delete`) && <DeleteOutlined key="delete" style={{ color: "#d32029" }} onClick={() => handleDelete(record.id)} />,
                            ].filter(Boolean)}
                        >
                            <Meta
                                avatar={<Avatar size={64} icon={<UserOutlined />} src={record.gender === 'female' ? "/avatar_female.png" : "/avatar_male.png"} />}
                                
                                description={
                                    <div>
                                        <div>{record.email}</div>
                                        <div style={{ marginTop: 5, fontStyle: "italic" }}>
                                            {record.role_name ? record.role_name.charAt(0).toUpperCase() + record.role_name.slice(1) : ""}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {items.length > 0 && (
                <PaginationControl
                    page={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={handlePageChange}
                />
            )}

            <Modal
                open={modalVisible}
                title={null}
                footer={null}
                width={800}
                onCancel={handleCloseModal}
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
                                onCancel={handleCloseModal}
                            />
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleFormSubmit}
                                style={{ padding: "0 10px" }}
                            >
                                {moduleData.blocks.map((block) => (
                                    <FormSection
                                        key={block.block_id}
                                        title={block.block_name}
                                        fields={block.fields.filter(f => !hiddenFields?.includes(f.name))}
                                    />
                                ))}
                                <FormFooter onCancel={handleCloseModal} onSave={() => form.submit()} />
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: 50 }}>No hay campos para mostrar.</div>
                    )
                ) : (
                    <div style={{ textAlign: "center", padding: 50 }}>
                        <Spin /> <p>Cargando campos...</p>
                    </div>
                )}
            </Modal>

            <DrawerDetails
                visible={drawerVisible}
                onClose={handleDrawerClose}
                data={drawerData}
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

export default Students;