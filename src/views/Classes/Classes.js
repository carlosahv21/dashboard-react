import React, { useEffect, useState } from "react"; 
import { Table, Input, Select, Pagination, Space, Breadcrumb, Button, Modal, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchClasses = async () => {
        try {
            setLoading(true);

            // ✅ Enviar solo parámetros que tengan valor
            const params = { page, search };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v)
            ).toString();

            const data = await request(`classes/?${queryParams}`, "GET");

            setClasses(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search.length >= 3 || search.length === 0) {
                setPage(1); // reinicia paginación cuando cambia filtro o búsqueda
                fetchClasses();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        fetchClasses();
    }, [page]);

    // ✅ Manejo de eliminación con confirmación
    const handleDelete = async (id) => {
        try {
            await request(`classes/${id}`, "DELETE");
            message.success("Clase eliminada correctamente");
            setClasses((prev) => prev.filter((cls) => cls.id !== id));
        } catch (error) {
            console.error("Error deleting class:", error);
            message.error("Error al eliminar la clase");
        }
    };

    const handleDeleteConfirm = (id) => {
        confirm({
            title: "¿Eliminar clase?",
            content: "Esta acción no se puede deshacer.",
            okText: "Sí, eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: () => handleDelete(id),
        });
    };

    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name" },
        { title: "Nivel", dataIndex: "level", key: "level" },
        { title: "Genero", dataIndex: "genre", key: "genre" },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/classes/edit/${record.id}`)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteConfirm(record.id)}
                    />
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

            <Space
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "end",
                }}
            >
                <Search
                    placeholder="Search Classes"
                    allowClear
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 200 }}
                />
                <Button
                    type="primary"
                    onClick={() => navigate("/classes/create")}
                >
                    Crear Clase
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={classes}
                loading={loading}
                pagination={false}
                rowKey="id"
                bordered
            />

            <Pagination
                align="end"
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
