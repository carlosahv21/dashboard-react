// components/BaseView.js
import React, { useContext } from "react";
import { Form, Spin, App, Modal, Row, Col, Empty } from "antd";
import { utils, writeFileXLSX } from "xlsx";

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
    viewOptions,
    cardComponent: CardComponent,
}) => {
    const { hasPermission } = useContext(AuthContext);
    const { message, modal } = App.useApp();
    const [form] = Form.useForm();

    // Determine initial view and page size before useCrud
    const initialView = viewOptions?.[0] || "table";
    const initialPageSize = initialView === "card" ? 8 : 10;

    const initialSort = columns.reduce(
        (acc, col) => {
            if (col.defaultSortOrder) {
                return { field: col.dataIndex || col.key, order: col.defaultSortOrder };
            }
            return acc;
        },
        { field: null, order: null }
    );

    const {
        items,
        loading,
        search,
        setSearch,
        pagination,
        fetchItems,
        handlePageChange,
        handlePageSizeChange,
        setItems,
        setPagination,
        request,
        handleTableChange,
        getAllItems,
        selectedKeys,
        setSelectedKeys,
        isAllSelected,
        handleSelectAll,
        setIsAllSelected,
    } = useCrud(endpoint, titlePlural, filters, initialSort, initialPageSize);

    const {
        modalVisible,
        editingId,
        moduleData,
        openModal,
        closeModal,
        handleSubmit,
    } = useFormModal(
        request,
        endpoint,
        moduleFieldId,
        titleSingular,
        fixedValues,
        form
    );

    const {
        drawerVisible,
        selectedRecordId,
        drawerData,
        drawerLoading,
        handleRowClick,
        handleDrawerClose,
    } = useDrawerDetail(request, endpoint, titleSingular);

    const handleDelete = async (id) => {
        try {
            await request(`${endpoint}/${id}`, "DELETE");
            message.success(
                `${titleSingular} eliminad${titleSingular.endsWith("a") ? "a" : "o"
                } correctamente`
            );
            setItems((prev) => prev.filter((i) => i.id !== id));
            setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error(error?.message || `Error al eliminar ${titleSingular}`);
        }
    };

    const handleBulkDelete = () => {
        if (selectedKeys.length === 0) {
            message.warning(`Debe seleccionar al menos un registro para eliminar`);
            return;
        }

        modal.confirm({
            title: `¿Eliminar ${isAllSelected ? "todos los" : selectedKeys.length
                } registros?`,
            content: `Esta acción no se puede deshacer. Se eliminán ${isAllSelected ? pagination.total : selectedKeys.length
                } registros.`,
            okText: "Sí, eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: async () => {
                const hide = message.loading("Eliminando registros...", 0);
                try {
                    let idsToDelete = selectedKeys;
                    if (isAllSelected) {
                        const allItems = await getAllItems();
                        idsToDelete = allItems.map((i) => i.id);
                    }

                    for (let i = 0; i < idsToDelete.length; i += 5) {
                        const chunk = idsToDelete.slice(i, i + 5);
                        await Promise.all(
                            chunk.map((id) => request(`${endpoint}/${id}`, "DELETE"))
                        );
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
            },
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
        if (selectedKeys.length === 0) {
            message.warning(`Debe seleccionar al menos un registro para exportar`);
            return;
        }

        const allData = await getAllItems();
        let dataToExport = allData;

        if (!isAllSelected && selectedKeys.length > 0) {
            dataToExport = allData.filter((item) => selectedKeys.includes(item.id));
        }

        exportToExcel(dataToExport, titlePlural);
    };

    const exportToExcel = (data, title) => {
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, title);
        writeFileXLSX(wb, `${title}.xlsx`);
    };

    const [currentView, setCurrentView] = React.useState(initialView);

    // Helper functions for adaptive pagination
    const getPageSizeOptions = (view) => {
        if (view === "card") {
            return [8, 16, 24, 48, 96];
        }
        return [5, 10, 20, 50, 100];
    };

    const adjustPageSizeForView = (currentSize, targetView) => {
        const options = getPageSizeOptions(targetView);

        // Find closest option
        return options.reduce((prev, curr) => {
            return Math.abs(curr - currentSize) < Math.abs(prev - currentSize)
                ? curr
                : prev;
        });
    };

    const handleViewChange = (view) => {
        setCurrentView(view);

        // Adjust page size when changing views
        const newPageSize = adjustPageSizeForView(pagination.pageSize, view);
        if (newPageSize !== pagination.pageSize) {
            handlePageSizeChange(newPageSize);
        }
    };

    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (keys) => setSelectedKeys(keys),
        onSelectAll: (selected) => handleSelectAll(selected),
        onSelect: (record, selected) => {
            if (!selected && isAllSelected) {
                setIsAllSelected(false);
            }
        },
    };

    return (
        <>
            <SearchFilter
                search={search}
                setSearch={setSearch}
                canCreate={hasPermission(`${endpoint}:create`)}
                canDelete={hasPermission(`${endpoint}:delete`)}
                onCreate={() => openModal()}
                title={titleSingular}
                titlePlural={titlePlural}
                pageSize={pagination.pageSize}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={getPageSizeOptions(currentView)}
                onExport={handleExport}
                onBulkDelete={handleBulkDelete}
                viewOptions={viewOptions}
                currentView={currentView}
                onViewChange={handleViewChange}
            />

            {currentView === "table" ? (
                <DataTable
                    columns={columns}
                    data={items}
                    loading={loading}
                    onEdit={hasPermission(`${endpoint}:edit`) ? openModal : undefined}
                    onDelete={
                        hasPermission(`${endpoint}:delete`) ? handleDelete : undefined
                    }
                    disableEdit={(record) =>
                        ["admin"].includes(record.role_name?.toLowerCase())
                    }
                    disableDelete={(record) =>
                        ["admin"].includes(record.role_name?.toLowerCase())
                    }
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: "pointer" },
                    })}
                    selectedRowId={selectedRecordId}
                    onChange={handleTableChange}
                    rowSelection={rowSelection}
                />
            ) : CardComponent ? (
                loading ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[16, 16]} justify="start">
                        {items.length === 0 && (
                            <Col xs={24}>
                                <Empty />
                            </Col>
                        )}
                        {items.map((item) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.id}>
                                <CardComponent
                                    record={item}
                                    onEdit={openModal}
                                    onDelete={handleDelete}
                                    onRowClick={handleRowClick}
                                    canEdit={hasPermission(`${endpoint}:edit`)}
                                    canDelete={hasPermission(`${endpoint}:delete`)}
                                />
                            </Col>
                        ))}
                    </Row>
                )
            ) : null}

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
                destroyOnHidden
            >
                {moduleData ? (
                    moduleData.blocks?.length > 0 ? (
                        <>
                            <FormHeader
                                title={
                                    editingId
                                        ? `Editar ${titleSingular}`
                                        : `Crear ${titleSingular}`
                                }
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
                                        fields={block.fields.filter(
                                            (f) => !hiddenFields?.includes(f.name)
                                        )}
                                    />
                                ))}
                                <FormFooter
                                    onCancel={handleCloseModal}
                                    onSave={() => form.submit()}
                                />
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: 50 }}>
                            No hay campos para mostrar.
                        </div>
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
