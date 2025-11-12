import React, { useEffect, useState } from "react";
import { message } from "antd";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import DataTable from "../../../components/Common/DataTable";

const RolePermissions = () => {
    const [permissions, setPermissions] = useState([]); // Lista de todos los permisos
    const [roles, setRoles] = useState([]); // Lista de roles
    const [rolePermissions, setRolePermissions] = useState([]); // Lista de relaciones role-permission
    const [loading, setLoading] = useState(false);
    const { request } = useFetch();

    // --- Cargar permisos por rol ---
    const fetchRolePermissions = async () => {
        try {
            setLoading(true);
            const data = await request("rolePermissions", "GET");

            const allPermissions = [];
            const allRolePermissions = [];

            data.forEach(role => {
                role.permissions.forEach(p => {
                    if (!allPermissions.find(ap => ap.id === p.id)) allPermissions.push(p);
                    allRolePermissions.push({ role_id: role.role_id, permission_id: p.id });
                });
            });

            setPermissions(allPermissions);
            setRoles(data.map(r => ({ id: r.role_id, name: r.role_name })));
            setRolePermissions(allRolePermissions);
        } catch (error) {
            console.error(error);
            message.error("Error al cargar permisos por rol");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRolePermissions();
    }, []);

    // --- Toggle permiso ---
    const togglePermission = async (roleId, permissionId) => {
        try {
            const exists = rolePermissions.some(
                rp => rp.role_id === roleId && rp.permission_id === permissionId
            );

            if (exists) {
                // Quitar permiso
                await request(`rolePermissions/${roleId}/${permissionId}`, "DELETE");
                setRolePermissions(prev =>
                    prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId))
                );
                message.success("Permiso removido correctamente");
            } else {
                // Añadir permiso
                await request(`rolePermissions/${roleId}`, "POST", { permission_ids: [permissionId] });
                setRolePermissions(prev => [...prev, { role_id: roleId, permission_id: permissionId }]);
                message.success("Permiso añadido correctamente");
            }
        } catch (error) {
            console.error(error);
            message.error("Error al actualizar permiso");
        }
    };

    // --- Columnas para DataTable ---
    const columns = [
        {
            title: "Permiso",
            dataIndex: "name",
            key: "name",
            render: (text) => <span>{text}</span>
        },
        ...roles.map(role => ({
            title: role.name,
            key: role.id,
            render: (_, record) => {
                const hasPermission = rolePermissions.some(
                    rp => rp.role_id === role.id && rp.permission_id === record.id
                );

                // Deshabilitar checkbox si es admin
                const isAdmin = role.name.toLowerCase() === "admin";

                return (
                    <input
                        type="checkbox"
                        checked={hasPermission}
                        disabled={isAdmin}
                        onChange={() => togglePermission(role.id, record.id)}
                    />
                );
            }
        }))
    ];

    return (
        <div>
            <FormHeader
                title="Permisos por Rol"
                subtitle="Gestiona qué permisos tiene cada rol"
            />

            <DataTable
                columns={columns}
                data={permissions}
                loading={loading}
                showActions={false} // No mostrar columna de acciones
            />
        </div>
    );
};

export default RolePermissions;
