import React, { useState, useEffect } from "react";
import { Table, Switch, message } from "antd";
import FormHeader from "../../../components/Common/FormHeader";
import useFetch from "../../../hooks/useFetch";

const ActiveModules = () => {
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
                message.error(error || "Failed to fetch modules.");
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [request, error]);

    const handleToggle = async (id) => {
        try {
            const response = await request(`modules/${id}/toggle`, "POST");
            if (response.success) {
                setModules((prev) =>
                    prev.map((module) =>
                        module.id === id ? { ...module, is_active: response.is_active } : module
                    )
                );
                message.success("Module status updated successfully.");
            }
        } catch {
            message.error(error || "Failed to update module status.");
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Category",
            dataIndex: "tab",
            key: "tab",
        },
        {
            title: "Status",
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
        <div style={{ backgroundColor: "#fff", borderRadius: "8px" }}>
            <FormHeader
                title={"Active Modules"}
                subtitle="Manage the modules that are currently active in your application."
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
