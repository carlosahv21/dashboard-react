import React, { useEffect, useState } from "react";
import { Breadcrumb, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import DataTable from "../../../components/Common/DataTable";
import PaginationControl from "../../../components/Common/PaginationControl";
import SearchFilter from "../../../components/Common/SearchFilter";
import FormHeader from "../../../components/Common/FormHeader";

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const { request } = useFetch();
    const navigate = useNavigate();

    const fetchPermissions = async (page = pagination.current) => {
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

            const data = await request(`permissions?${queryParams}`, "GET");
            setPermissions(data.data || []);

            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / pagination.pageSize));
            const current = page > lastPage ? lastPage : page;

            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error("Error al cargar perfiles");
        } finally {
            setLoading(false);
        }
    };

    // --- Búsqueda con debounce ---
    useEffect(() => {
        const delay = setTimeout(() => fetchPermissions(1), 500);
        return () => clearTimeout(delay);
    }, [search]);

    // --- Cambio de página desde PaginationControl ---
    const handlePageChange = (newPage) => {
        fetchPermissions(newPage);
    };

    const handleDelete = async (id) => {
        try {
            await request(`permissions/${id}`, "DELETE");
            message.success("Perfil eliminado correctamente");
            setPermissions(prev => prev.filter(profile => profile.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error("Error al eliminar el perfil");
        }
    };

    const columns = [
        { title: "Nombre", dataIndex: "name", key: "name" },
        { title: "Descripción", dataIndex: "description", key: "description" },
    ];

    return (
        <div>
            <FormHeader
                title="Perfiles"
                subtitle="Administrar perfiles del sistema"
            />
            <SearchFilter
                search={search}
                setSearch={setSearch}
                onCreate={() => navigate("/permissions/create")}
                title="Perfil"
            />

            <DataTable
                columns={columns}
                data={permissions}
                loading={loading}
                onEdit={(id) => navigate(`/permissions/edit/${id}`)}
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

export default Permissions;