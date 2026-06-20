import React, { useEffect, useState, useCallback } from "react";
import { message, Checkbox, Select, Button, Space } from "antd";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import DataTable from "../../../components/Common/DataTable";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const ACTIONS = ["view", "create", "edit", "delete"];
const SCOPES = ["all", "own", "assigned"];
const DEFAULT_SCOPE = "own";

const RolePermissions = () => {
    const { t } = useTranslation();
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    // Permisos concedidos localmente, mapeados a su scope: { [permission_id]: scope }
    const [localScopes, setLocalScopes] = useState({});

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
                            permission_id: p.id,
                            scope: p.scope ?? DEFAULT_SCOPE
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
            message.error(t('settings.permissionsLoadError'));
        } finally {
            setLoading(false);
        }
    }, [request, selectedRole, t]);

    useEffect(() => {
        fetchRolePermissions();
    }, [fetchRolePermissions]);

    // Cargar permisos locales (id → scope) cuando cambia el rol
    useEffect(() => {
        if (!selectedRole) return;

        const current = rolePermissions
            .filter(rp => rp.role_id === selectedRole)
            .reduce((acc, rp) => {
                acc[rp.permission_id] = rp.scope ?? DEFAULT_SCOPE;
                return acc;
            }, {});

        setLocalScopes(current);
    }, [selectedRole, rolePermissions]);

    // Conceder/revocar en local, sin backend. Al conceder usa el scope por defecto.
    const toggleLocalPermission = (permissionId) => {
        setLocalScopes(prev => {
            if (permissionId in prev) {
                const { [permissionId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [permissionId]: DEFAULT_SCOPE };
        });
    };

    // Cambiar el scope de un permiso ya concedido
    const setLocalScope = (permissionId, scope) => {
        setLocalScopes(prev => ({ ...prev, [permissionId]: scope }));
    };

    // Enviar al backend
    const savePermissions = async () => {
        try {
            await request(`rolePermissions/${selectedRole}`, "POST", {
                role_id: selectedRole,
                permission_ids: permissions
                    .filter(p => p.id in localScopes)
                    .map(p => ({ permission_id: p.id, scope: localScopes[p.id] }))
            });

            message.success(t('settings.permissionsSaveSuccess'));

            fetchRolePermissions();
        } catch (error) {
            console.error(error);
            message.error(t('settings.permissionsSaveError'));
        }
    };

    const formatModuleName = (module) => {
        if (!module) return "";
        const parts = module.split(".");
        const name = parts[parts.length - 1];
        return t(`menu.${name}`, { defaultValue: name.charAt(0).toUpperCase() + name.slice(1) });
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
            title: t('settings.module'),
            dataIndex: "module",
            key: "module"
        },
        ...ACTIONS.map(action => ({
            title: t(`settings.${action}`),
            key: action,
            render: (_, record) => {
                const perm = record[action];
                if (!perm) return <Checkbox disabled />;

                const granted = perm.id in localScopes;
                const isAdmin = roles.find(r => r.id === selectedRole)?.name.toLowerCase() === "admin";

                return (
                    <Space size={8}>
                        <Checkbox
                            checked={granted}
                            disabled={isAdmin}
                            onChange={() => toggleLocalPermission(perm.id)}
                        />
                        {granted && (
                            <Select
                                size="small"
                                style={{ width: 120 }}
                                value={localScopes[perm.id]}
                                disabled={isAdmin}
                                onChange={(scope) => setLocalScope(perm.id, scope)}
                            >
                                {SCOPES.map(scope => (
                                    <Option key={scope} value={scope}>
                                        {t(`settings.scope_${scope}`)}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Space>
                );
            }
        }))
    ];

    return (
        <>
            <FormHeader
                title={t('settings.permissionsTitle')}
                subtitle={t('settings.permissionsSubtitle')}
            />

            <div style={{ paddingTop: 20, paddingBottom: 20, display: "flex", gap: 20 }}>
                <Select
                    style={{ width: 300 }}
                    placeholder={t('settings.selectRole')}
                    value={selectedRole}
                    onChange={value => setSelectedRole(value)}
                    allowClear
                >
                    {roles.map(role => (
                        <Option key={role.id} value={role.id}>
                            {t(`roles.${role.name.toLowerCase()}`, { defaultValue: role.name })}
                        </Option>
                    ))}
                </Select>

                <Button
                    type="primary"
                    onClick={savePermissions}
                    disabled={!selectedRole}
                >
                    {t('settings.saveChanges')}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={dataTableData}
                loading={loading}
                showActions={false}
                rowKey="key"
            />
        </>
    );
};

export default RolePermissions;
