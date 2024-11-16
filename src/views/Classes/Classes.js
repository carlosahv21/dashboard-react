import React, { useEffect, useState } from "react";
import { Table, Input, Select, Pagination, Space, Breadcrumb, Button, Popconfirm, message } from "antd";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const { Search } = Input;
const { Option } = Select;

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState("");

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchClasses = async () => {
        try {
            const data = await request("classes/", "GET", { page, search, level });
            setClasses(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [page, search, level]);

    const handleDelete = async (id) => {
        try {
            // Usa el método genérico `request` con 'DELETE'
            await request(`classes/${id}`, 'DELETE');
            message.success('Class deleted successfully!');
            // Actualiza la lista localmente
            setClasses((prev) => prev.filter((cls) => cls.id !== id));
        } catch (error) {
            console.error('Error deleting class:', error);
            message.error('Failed to delete the class. Please try again.');
        }
    };
    

    const columns = [
        {
            title: "Nombre",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Nivel",
            dataIndex: "level",
            key: "level",
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => navigate(`/classes/edit/${record.id}`)}>
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta clase?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Eliminar
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item>Clases</Breadcrumb.Item>
            </Breadcrumb>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
                <Search
                    placeholder="Buscar clases"
                    onSearch={setSearch}
                    style={{ width: 200 }}
                />
                <Select
                    placeholder="Filtrar por nivel"
                    onChange={setLevel}
                    allowClear
                    style={{ width: 200 }}
                >
                    <Option value="Basic">Basic</Option>
                    <Option value="Intermediate">Intermediate</Option>
                    <Option value="Advanced">Advanced</Option>
                </Select>
                <Button
                    type="primary"
                    onClick={() => navigate('/classes/create')}
                >
                    Crear Clase
                </Button>
            </Space>
            <Table
                columns={columns}
                dataSource={classes}
                loading={false}
                pagination={false}
                rowKey="id"
                bordered
            />
            <Pagination
                current={page}
                total={total}
                pageSize={10}
                onChange={setPage}
                style={{ marginTop: 16 }}
            />
        </div>
    );
};

export default Classes;
