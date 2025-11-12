import React, { useEffect, useState } from "react";
import { Breadcrumb, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import DataTable from "../../../components/Common/DataTable";
import PaginationControl from "../../../components/Common/PaginationControl";
import SearchFilter from "../../../components/Common/SearchFilter";

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchRoles = async (page = pagination.current) => {
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

            const data = await request(`roles?${queryParams}`, "GET");
            setRoles(data.data || []);

            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / pagination.pageSize));
            const current = page > lastPage ? lastPage : page;

            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error("Error al cargar roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchRoles(1), 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handlePageChange = (newPage) => {
        fetchRoles(newPage);
    };

    const handleDelete = async (id) => {
        try {
            await request(`roles/${id}`, "DELETE");
            message.success("Rol eliminado correctamente");
            setRoles(prev => prev.filter(role => role.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error("Error al eliminar el rol");
        }
    };

    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name" },
        { title: "Descripción", dataIndex: "description", key: "description" },
    ];

    return (
        <div>
            <SearchFilter
                search={search}
                setSearch={setSearch}
                onCreate={() => navigate("/roles/create")}
                title="Rol"
            />

            <DataTable
                columns={columns}
                data={roles}
                loading={loading}
                onEdit={(id) => navigate(`/roles/edit/${id}`)}
                onDelete={handleDelete}
                pagination={pagination}
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

export default Roles;
