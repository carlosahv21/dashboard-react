import React, { useEffect, useState } from "react";
import { message, Checkbox, Select } from "antd";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import DataTable from "../../../components/Common/DataTable";

const { Option } = Select;
const ACTIONS = ["view", "create", "edit", "delete"];

const RolePermissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const { request } = useFetch();

    const fetchRolePermissions = async () => {
        try {
            setLoading(true);
            const data = await request("rolePermissions", "GET");

            const allPermissions = [];
            const allRolePermissions = [];

            data.forEach(role => {
                role.permissions.forEach(p => {
                    if (p.id != null && !allPermissions.find(ap => ap.id === p.id)) allPermissions.push(p);
                    if (p.id != null) allRolePermissions.push({ role_id: role.role_id, permission_id: p.id });
                });
            });

            setPermissions(allPermissions);
            setRoles(data.map(r => ({ id: r.role_id, name: r.role_name })));
            setRolePermissions(allRolePermissions);

            const admin = data.find(r => r.role_name.toLowerCase() === "admin");
            if (admin) setSelectedRole(admin.role_id);
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

    const togglePermission = async (roleId, permissionId) => {
        try {
            const exists = rolePermissions.some(
                rp => rp.role_id === roleId && rp.permission_id === permissionId
            );

            if (exists) {
                await request(`rolePermissions/${roleId}/${permissionId}`, "DELETE");
                setRolePermissions(prev =>
                    prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId))
                );
                message.success("Permiso removido correctamente");
            } else {
                await request(`rolePermissions/${roleId}`, "POST", { permission_ids: [permissionId] });
                setRolePermissions(prev => [...prev, { role_id: roleId, permission_id: permissionId }]);
                message.success("Permiso añadido correctamente");
            }
        } catch (error) {
            console.error(error);
            message.error("Error al actualizar permiso");
        }
    };

    const formatModuleName = (module) => {
        if (!module) return "";
        const parts = module.split(".");
        const name = parts[parts.length - 1];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Agrupar permisos por módulo
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const moduleName = formatModuleName(perm.module);
        if (!acc[moduleName]) acc[moduleName] = {};
        acc[moduleName][perm.name] = perm;
        return acc;
    }, {});

    const dataTableData = Object.entries(groupedPermissions).map(([module, perms]) => ({
        key: module, // este key sigue siendo único por módulo
        module,
        ...perms
    }));

    const columns = [
        {
            title: "Módulo",
            dataIndex: "module",
            key: "module"
        },
        ...ACTIONS.map(action => ({
            title: action.charAt(0).toUpperCase() + action.slice(1),
            key: action,
            render: (_, record) => {
                const perm = record[action];
                if (!perm) return <Checkbox disabled key={`empty-${record.key}-${action}`} />;

                // Filtrar solo permisos del rol seleccionado
                const selectedRolePerms = rolePermissions.filter(
                    rp => rp.role_id === selectedRole
                );
                
                const hasPermission = selectedRolePerms.some(
                    rp => rp.permission_id === perm.id
                );

                const isAdmin = roles.find(r => r.id === selectedRole)?.name.toLowerCase() === "admin";

                return (
                    <Checkbox
                        key={`perm-${perm.id}`}
                        checked={hasPermission}
                        disabled={isAdmin}
                        onChange={() => togglePermission(selectedRole, perm.id)}
                    />
                );
            }
        }))
    ];

    return (
        <>
            <FormHeader
                title="Permisos por Rol"
                subtitle="Gestiona los permisos del rol seleccionado"
            />

            <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                <Select
                    style={{ width: 300 }}
                    placeholder="Selecciona un rol"
                    value={selectedRole}
                    onChange={value => setSelectedRole(value)}
                    allowClear
                >
                    {roles.map(role => (
                        <Option key={role.id} value={role.id}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </Option>
                    ))}
                </Select>
            </div>

            <DataTable
                columns={columns}
                data={dataTableData}
                loading={loading}
                showActions={false}
            />
        </>
    );
};

export default RolePermissions;
