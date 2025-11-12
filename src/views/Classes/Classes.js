import React, { useEffect, useState } from "react";
import { Breadcrumb, message } from "antd";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import SearchFilter from "../../components/Common/SearchFilter";
import DataTable from "../../components/Common/DataTable";
import PaginationControl from "../../components/Common/PaginationControl";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchClasses = async (page = pagination.current) => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: pagination.pageSize,
                search: search.length >= 3 ? search : undefined,
            };

            const queryParams = new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
            ).toString();

            const data = await request(`classes/?${queryParams}`, "GET");

            setClasses(data.data || []);

            // Ajustamos total y current de manera dinámica
            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / pagination.pageSize));
            const current = page > lastPage ? lastPage : page;

            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error("Error al cargar las clases");
        } finally {
            setLoading(false);
        }
    };

    // --- Búsqueda con debounce ---
    useEffect(() => {
        const delay = setTimeout(() => fetchClasses(1), 500);
        return () => clearTimeout(delay);
    }, [search]);

    // --- Cambio de página desde PaginationControl ---
    const handlePageChange = (newPage) => {
        fetchClasses(newPage);
    };

    // --- Eliminar registro ---
    const handleDelete = async (id) => {
        try {
            await request(`classes/${id}`, "DELETE");
            message.success("Clase eliminada correctamente");

            setClasses(prev => prev.filter(cls => cls.id !== id));

            // Recalculamos el total y la última página
            const newTotal = pagination.total - 1;
            const lastPage = Math.max(1, Math.ceil(newTotal / pagination.pageSize));
            const newCurrent = pagination.current > lastPage ? lastPage : pagination.current;

            setPagination(prev => ({ ...prev, total: newTotal, current: newCurrent }));

            if (newCurrent !== pagination.current) {
                fetchClasses(newCurrent);
            }
        } catch (error) {
            message.error("Error al eliminar la clase");
        }
    };

    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name", sorter: true },
        {
            title: "Nivel",
            dataIndex: "level",
            key: "level",
            filters: [
                { text: "Básico", value: "Basic" },
                { text: "Intermedio", value: "Intermediate" },
                { text: "Avanzado", value: "Advanced" },
            ],
        },
        { title: "Genero", dataIndex: "genre", key: "genre" },
        { title: "Dias de clase", dataIndex: "date", key: "date" },
        { title: "Horas de clase", dataIndex: "hour", key: "hour" },
    ];

    return (
        <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item>Clases</Breadcrumb.Item>
            </Breadcrumb>

            <SearchFilter
                search={search}
                setSearch={setSearch}
                onCreate={() => navigate("/classes/create")}
            />

            <DataTable
                columns={columns}
                data={classes}
                loading={loading}
                pagination={pagination}
                onEdit={(id) => navigate(`/classes/edit/${id}`)}
                onDelete={handleDelete}
            />

            <PaginationControl
                page={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
            />
        </div>
    );
};

export default Classes;
