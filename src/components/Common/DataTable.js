import React from "react";
import { Table, Space, Button, App } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const DataTable = ({
    columns,
    data,
    loading,
    onEdit,
    onDelete,
    showActions = true,
    disableDelete,
    disableEdit,
    onRow,
    selectedRowId,
    onChange,
    rowSelection
}) => {
    const { modal } = App.useApp();
    const { t } = useTranslation();

    const handleDeleteConfirm = (id, record) => {
        modal.confirm({
            title: t('global.deleteTitle'),
            content: t('global.deleteConfirm'),
            okText: t('global.yes'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: () => onDelete && onDelete(id, record),
        });
    };

    const enhancedColumns = showActions && (onEdit || onDelete)
        ? [
            ...columns,
            {
                title: t('global.actions'),
                key: "actions",
                render: (_, record) => {
                    const editDisabled = disableEdit ? disableEdit(record) : false;
                    const deleteDisabled = disableDelete ? disableDelete(record) : false;

                    return (
                        <Space size="middle">
                            {onEdit && (
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    style={{ color: "#13a8a8" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        !editDisabled && onEdit(record.id);
                                    }}
                                    disabled={editDisabled}
                                />
                            )}
                            {onDelete && (
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        !deleteDisabled && handleDeleteConfirm(record.id, record);
                                    }}
                                    disabled={deleteDisabled}
                                />
                            )}
                        </Space>
                    );
                }

            },
        ]
        : columns;

    return (
        <Table
            columns={enhancedColumns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            bordered
            pagination={false}
            onRow={onRow}
            onChange={onChange}
            showSorterTooltip={false}
            rowClassName={(record) => record.id === selectedRowId ? "ant-table-row-selected" : ""}
            rowSelection={rowSelection}
        />
    );
};

export default DataTable;