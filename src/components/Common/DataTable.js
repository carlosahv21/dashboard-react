import React from "react";
import { Table, Space, Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const DataTable = ({ columns, data, loading, onEdit, onDelete }) => {
    const handleDeleteConfirm = (id) => {
        confirm({
            title: "¿Eliminar?",
            content: "Esta acción no se puede deshacer.",
            okText: "Sí",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: () => onDelete(id),
        });
    };

    const enhancedColumns = [
        ...columns,
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteConfirm(record.id)} />
                </Space>
            ),
        },
    ];

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
