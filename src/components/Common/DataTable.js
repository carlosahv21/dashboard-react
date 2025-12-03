import React from "react";
import { Table, Space, Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { confirm } = Modal;

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
    selectedRowId
}) => {
    const handleDeleteConfirm = (id, record) => {
        confirm({
            title: "¿Eliminar?",
            content: "Esta acción no se puede deshacer.",
            okText: "Sí",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: () => onDelete && onDelete(id, record),
        });
    };

    const enhancedColumns = showActions && (onEdit || onDelete)
        ? [
            ...columns,
            {
                title: "Acciones",
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
                                    // MODIFICACIÓN 1: Usar e.stopPropagation()
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        !editDisabled && onEdit(record);
                                    }}
                                    disabled={editDisabled}
                                />
                            )}
                            {onDelete && (
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    // MODIFICACIÓN 2: Usar e.stopPropagation()
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
            rowClassName={(record) => record.id === selectedRowId ? "ant-table-row-selected" : ""}
        />
    );
};

export default DataTable;