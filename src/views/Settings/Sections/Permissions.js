import React, { useEffect, useState, useCallback } from "react";
import { message, Checkbox, Select, Button } from "antd";
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

    // Nuevo: permisos seleccionados localmente
    const [localRolePermissions, setLocalRolePermissions] = useState([]);

    const [loading, setLoading] = useState(false);

    const { request } = useFetch();

    const fetchRolePermissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await request("rolePermissions", "GET");
            const data = response.data;

            const allPermissions = [];
            const allRolePermissions = [];

            data.forEach(role => {
                role.permissions.forEach(p => {
                    if (p.id != null && !allPermissions.find(ap => ap.id === p.id))
                        allPermissions.push(p);

                    if (p.id != null)
                        allRolePermissions.push({
                            role_id: role.role_id,
                            permission_id: p.id
                        });
                });
            });

            setPermissions(allPermissions);
            setRoles(data.map(r => ({ id: r.role_id, name: r.role_name })));
            setRolePermissions(allRolePermissions);

            if (!selectedRole) {
                const admin = data.find(r => r.role_name.toLowerCase() === "admin");
                if (admin) setSelectedRole(admin.role_id);
            }
        } catch (error) {
            console.error(error);
            message.error("Error al cargar permisos por rol");
        } finally {
            setLoading(false);
        }
    }, [request, selectedRole]);

    useEffect(() => {
        fetchRolePermissions();
    }, [fetchRolePermissions]);

    // Cargar permisos locales cuando cambia el rol
    useEffect(() => {
        if (!selectedRole) return;

        const current = rolePermissions
            .filter(rp => rp.role_id === selectedRole)
            .map(rp => rp.permission_id);

        setLocalRolePermissions(current);
    }, [selectedRole, rolePermissions]);

    // Cambiar en local, sin backend
    const toggleLocalPermission = (permissionId) => {
        setLocalRolePermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    // Enviar al backend
    const savePermissions = async () => {
        try {
            await request(`rolePermissions/${selectedRole}`, "POST", {
                permission_ids: localRolePermissions
            });

            message.success("Permisos actualizados correctamente");

            fetchRolePermissions();
        } catch (error) {
            console.error(error);
            message.error("Error al guardar permisos");
        }
    };

    const formatModuleName = (module) => {
        if (!module) return "";
        const parts = module.split(".");
        const name = parts[parts.length - 1];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        const moduleName = formatModuleName(perm.module);
        if (!acc[moduleName]) acc[moduleName] = {};
        acc[moduleName][perm.name] = perm;
        return acc;
    }, {});

    const dataTableData = Object.entries(groupedPermissions).map(([module, perms]) => ({
        key: module,
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
                if (!perm) return <Checkbox disabled />;

                const checked = localRolePermissions.includes(perm.id);
                const isAdmin = roles.find(r => r.id === selectedRole)?.name.toLowerCase() === "admin";

                return (
                    <Checkbox
                        checked={checked}
                        disabled={isAdmin}
                        onChange={() => toggleLocalPermission(perm.id)}
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

            <div style={{ paddingTop: 20, paddingBottom: 20, display: "flex", gap: 20 }}>
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

                <Button
                    type="primary"
                    onClick={savePermissions}
                    disabled={!selectedRole}
                >
                    Guardar cambios
                </Button>
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
