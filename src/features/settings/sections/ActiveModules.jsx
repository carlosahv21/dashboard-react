import React, { useState, useEffect } from "react";
import { Table, Switch, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import useFetch from "../../../hooks/useFetch";
import { useTranslation } from "react-i18next";

const ActiveModules = () => {
    const { t } = useTranslation();
    const { request, error } = useFetch();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                setLoading(true);
                const response = await request("modules", "GET");
                if (response && response.data) {
                    setModules(response.data);
                }
            } catch {
                message.error(error || t('settings.fetchModulesError'));
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [request, error, t]);

    const handleToggle = async (id) => {
        try {
            const response = await request(`modules/${id}/toggle`, "POST");
            if (response.success) {
                setModules((prev) =>
                    prev.map((module) =>
                        module.id === id ? { ...module, is_active: response.is_active } : module
                    )
                );
                message.success(t('settings.moduleStatusUpdated'));
            }
        } catch {
            message.error(error || t('settings.updateModuleError'));
        }
    };

    const columns = [
        {
            title: t('settings.moduleName'),
            dataIndex: "name",
            key: "name",
        },
        {
            title: t('settings.descriptionLabel'),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t('settings.category'),
            dataIndex: "tab",
            key: "tab",
        },
        {
            title: t('students.status'),
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggle(record.id)}
                />
            ),
        },
    ];

    return (
        <div style={{ borderRadius: "8px" }}>
            <FormHeader
                title={t('settings.activeModules')}
                subtitle={t('settings.activeModulesSubtitle')}
            />
            <Table
                style={{ marginTop: "20px" }}
                columns={columns}
                dataSource={modules}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ActiveModules;
