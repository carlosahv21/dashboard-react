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
    disableDelete // función: record => boolean
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
                    const isDisabled = disableDelete ? disableDelete(record) : false;
                    return (
                        <Space size="middle">
                            {onEdit && (
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit(record.id)}
                                />
                            )}
                            {onDelete && (
                                <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => !isDisabled && handleDeleteConfirm(record.id, record)}
                                    disabled={isDisabled}
                                />
                            )}
                        </Space>
                    );
                },
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
        />
    );
};

export default DataTable;
