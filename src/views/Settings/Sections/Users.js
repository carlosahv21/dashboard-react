import React, { useEffect, useState } from "react";
import { Breadcrumb, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import DataTable from "../../../components/Common/DataTable";
import PaginationControl from "../../../components/Common/PaginationControl";
import SearchFilter from "../../../components/Common/SearchFilter";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchUsers = async (page = pagination.current) => {
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

            const data = await request(`users?${queryParams}`, "GET");
            setUsers(data.data || []);

            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / pagination.pageSize));
            const current = page > lastPage ? lastPage : page;

            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchUsers(1), 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handlePageChange = (newPage) => {
        fetchUsers(newPage);
    };

    const handleDelete = async (id) => {
        try {
            await request(`users/${id}`, "DELETE");
            message.success("Usuario eliminado correctamente");
            setUsers(prev => prev.filter(user => user.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error("Error al eliminar el usuario");
        }
    };

    const columns = [
        {
            title: "Nombre",
            key: "full_name",
            render: (_, record) => `${record.first_name} ${record.last_name}`,
        },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Rol", dataIndex: "role", key: "role" },
    ];

    return (
        <div>
            <SearchFilter
                search={search}
                setSearch={setSearch}
                onCreate={() => navigate("/users/create")}
                title="Usuario"
            />

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                onEdit={(id) => navigate(`/users/edit/${id}`)}
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

export default Users;