import React, { useContext } from "react";
import { Form, Spin, App, Row, Col, Empty } from "antd";
import { utils, writeFileXLSX } from "xlsx";

import { useCrud } from "../../hooks/useCrud";
import { useFormModal } from "../../hooks/useFormModal";
import { useDrawerDetail } from "../../hooks/useDrawerDetail";
import { AuthContext } from "../../context/AuthContext";

import DataTable from "./DataTable";
import PaginationControl from "./PaginationControl";
import SearchFilter from "./SearchFilter";
import DrawerDetails from "./DrawerDetails";
import BaseFormModal from "./BaseFormModal";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const { hasPermission } = useContext(AuthContext);
    const { modal } = App.useApp();
    const [form] = Form.useForm();

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
        handleTableChange,
        getAllItems,
        handleDelete,
        handleBulkDelete,
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
    } = useFormModal(endpoint, moduleFieldId, titleSingular, fixedValues, form);

    const {
        drawerVisible,
        selectedRecordId,
        drawerData,
        drawerLoading,
        handleRowClick,
        handleDrawerClose,
    } = useDrawerDetail(endpoint, titleSingular);

    const handleFormSubmit = async (values) => {
        const shouldRefetch = await handleSubmit(values);
        if (shouldRefetch) fetchItems();
    };

    const handleExport = async () => {
        if (selectedKeys.length === 0) return;
        const allData = await getAllItems();
        let dataToExport = isAllSelected ? allData : allData.filter((item) => selectedKeys.includes(item.id));
        
        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, titlePlural);
        writeFileXLSX(wb, `${titlePlural}.xlsx`);
    };

    const [currentView, setCurrentView] = React.useState(initialView);

    const getPageSizeOptions = (view) => view === "card" ? [8, 16, 24, 48, 96] : [5, 10, 20, 50, 100];

    const handleViewChange = (view) => {
        setCurrentView(view);
        const options = getPageSizeOptions(view);
        const newSize = options.reduce((prev, curr) => Math.abs(curr - pagination.pageSize) < Math.abs(prev - pagination.pageSize) ? curr : prev);
        if (newSize !== pagination.pageSize) handlePageSizeChange(newSize);
    };

    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (keys) => setSelectedKeys(keys),
        onSelectAll: (selected) => handleSelectAll(selected),
        onSelect: (record, selected) => { if (!selected && isAllSelected) setIsAllSelected(false); },
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
                onBulkDelete={() => handleBulkDelete(modal, t)}
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
                    onDelete={hasPermission(`${endpoint}:delete`) ? (id) => handleDelete(id, titleSingular) : undefined}
                    disableEdit={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                    disableDelete={(record) => ["admin"].includes(record.role_name?.toLowerCase())}
                    onRow={(record) => ({ onClick: () => handleRowClick(record), style: { cursor: "pointer" } })}
                    selectedRowId={selectedRecordId}
                    onChange={handleTableChange}
                    rowSelection={rowSelection}
                />
            ) : CardComponent && (
                loading ? <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div> : (
                    <Row gutter={[16, 16]} justify="start">
                        {items.length === 0 && <Col xs={24}><Empty /></Col>}
                        {items.map((item) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.id}>
                                <CardComponent
                                    record={item}
                                    onEdit={openModal}
                                    onDelete={(id) => handleDelete(id, titleSingular)}
                                    onRowClick={handleRowClick}
                                    canEdit={hasPermission(`${endpoint}:edit`)}
                                    canDelete={hasPermission(`${endpoint}:delete`)}
                                />
                            </Col>
                        ))}
                    </Row>
                )
            )}

            <PaginationControl
                page={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
            />

            <BaseFormModal
                visible={modalVisible}
                editingId={editingId}
                moduleData={moduleData}
                titleSingular={titleSingular}
                hiddenFields={hiddenFields}
                form={form}
                onCancel={closeModal}
                onFinish={handleFormSubmit}
            />

            <DrawerDetails
                visible={drawerVisible}
                onClose={handleDrawerClose}
                data={drawerData}
                onEdit={hasPermission(`${endpoint}:edit`) ? openModal : undefined}
                onDelete={hasPermission(`${endpoint}:delete`) ? (id) => handleDelete(id, titleSingular) : undefined}
            >
                {drawerLoading && <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>}
            </DrawerDetails>
        </>
    );
};

export default BaseView;
