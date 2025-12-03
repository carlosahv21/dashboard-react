// components/BaseView.js
import React, { useContext } from "react";
import { message, Modal, Form, Spin } from "antd";

import { useCrud } from "../../hooks/useCrud";
import { useFormModal } from "../../hooks/useFormModal";
import { useDrawerDetail } from "../../hooks/useDrawerDetail";
import { AuthContext } from "../../context/AuthContext";

import DataTable from "./DataTable";
import PaginationControl from "./PaginationControl";
import SearchFilter from "./SearchFilter";
import FormSection from "./FormSection";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";
import DrawerDetails from "./DrawerDetails";

const BaseView = ({
    endpoint,
    moduleFieldId,
    columns,
    titleSingular,
    titlePlural,
    filters,
    fixedValues,
    hiddenFields,
}) => {
    const { hasPermission } = useContext(AuthContext);
    const [form] = Form.useForm();

    const {
        items, loading, search, setSearch, pagination, fetchItems,
        handlePageChange, handlePageSizeChange, setItems, setPagination, request
    } = useCrud(endpoint, titlePlural, filters);

    const {
        modalVisible, editingId, moduleData,
        openModal, closeModal, handleSubmit
    } = useFormModal(request, endpoint, moduleFieldId, titleSingular, fixedValues, form);

    const {
        drawerVisible, selectedRecordId, drawerData, drawerLoading,
        handleRowClick, handleDrawerClose
    } = useDrawerDetail(request, endpoint, titleSingular);

    const handleDelete = async (id) => {
        try {
            await request(`${endpoint}/${id}`, "DELETE");
            message.success(`${titleSingular} eliminad${titleSingular.endsWith('a') ? 'a' : 'o'} correctamente`);
            setItems(prev => prev.filter(i => i.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error(error?.message || `Error al eliminar ${titleSingular}`);
        }
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

    return (
        <>
            <SearchFilter
                search={search}
                setSearch={setSearch}
                canCreate={hasPermission(`${endpoint}:create`)}
                onCreate={() => openModal()}
                title={titleSingular}
                titlePlural={titlePlural}
                pageSize={pagination.pageSize}
                onPageSizeChange={handlePageSizeChange}
            />

            <DataTable
                columns={columns}
                data={items}
                loading={loading}
                onEdit={hasPermission(`${endpoint}:edit`) ? openModal : undefined}
                onDelete={hasPermission(`${endpoint}:delete`) ? handleDelete : undefined}
                disableEdit={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                disableDelete={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
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
                onCancel={handleCloseModal}
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

        </>
    );
};

export default BaseView;