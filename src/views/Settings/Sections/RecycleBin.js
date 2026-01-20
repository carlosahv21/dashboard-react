import React, { useState, useEffect, useCallback, useContext } from "react";
import { Typography, Space, Select, Table, Button, Modal, Input, App, theme, Divider, Empty, Tooltip } from "antd";
import { UndoOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import dayjs from "dayjs";
import { AuthContext } from "../../../context/AuthContext";

const { Title, Text } = Typography;

const RecycleBin = () => {
    const { request } = useFetch();
    const { message, modal } = App.useApp();
    const { token } = theme.useToken();
    const { hasPermission } = useContext(AuthContext);

    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingModules, setFetchingModules] = useState(true);

    // Modal state for permanent delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const fetchModules = useCallback(async () => {
        setFetchingModules(true);
        try {
            const response = await request("modules?has_recycle_bin=true", "GET");
            const availableModules = response.data.filter(m =>
                m.has_recycle_bin
            );
            setModules(availableModules);
            if (availableModules.length > 0) {
                setSelectedModule(availableModules[0].name);
            }
        } catch (err) {
            message.error("Error al cargar módulos");
        } finally {
            setFetchingModules(false);
        }
    }, [request, message]);

    const fetchData = useCallback(async (moduleName) => {
        if (!moduleName) return;
        setLoading(true);
        try {
            const response = await request(`${moduleName}?onlyDeleted=true`, "GET");
            
            setData(response.data || []);
        } catch (err) {
            message.error(`Error al cargar la papelera de ${moduleName}`);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [request, message]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    useEffect(() => {
        if (selectedModule) {
            fetchData(selectedModule);
        }
    }, [selectedModule, fetchData]);

    const handleRestore = (record) => {
        modal.confirm({
            title: "¿Restaurar registro?",
            content: `Estás a punto de restaurar el registro "${record.name || record.first_name || record.label || record.id}".`,
            okText: "Restaurar",
            cancelText: "Cancelar",
            onOk: async () => {
                try {
                    await request(`${selectedModule}/${record.id}/restore`, "PATCH");
                    message.success("Registro restaurado correctamente");
                    fetchData(selectedModule);
                } catch (err) {
                    message.error("Error al restaurar el registro");
                }
            }
        });
    };

    const showDeleteModal = (record) => {
        setRecordToDelete(record);
        setDeleteConfirmText("");
        setIsDeleteModalOpen(true);
    };

    const handlePermanentDelete = async () => {
        if (deleteConfirmText !== "eliminar") return;

        try {
            await request(`${selectedModule}/${recordToDelete.id}`, "DELETE");
            message.success("Registro eliminado permanentemente");
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
            fetchData(selectedModule);
        } catch (err) {
            message.error("Error al eliminar el registro permanentemente");
        }
    };

    const columns = [
        {
            title: "Nombre",
            key: "name",
            render: (_, record) => {
                const name = record.name || record.label || (record.first_name && `${record.first_name} ${record.last_name}`) || record.id;
                return <Text strong>{name}</Text>;
            }
        },
        {
            title: "Fecha de borrado",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (date) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
        },
        {
            title: "Acciones",
            key: "actions",
            align: "center",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Restaurar">
                        <Button
                            type="text"
                            icon={<UndoOutlined style={{ color: token.colorSuccess }} />}
                            onClick={() => handleRestore(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar permanentemente">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteModal(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const moduleName = modules.find(m => m.id === selectedModule)?.name || selectedModule;

    return (
        <>
            <FormHeader
                title="Papelera de Reciclaje"
                subtitle="Gestiona y restaura registros eliminados recientemente."
            />

            <div style={{ marginTop: 24 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Space align="center">
                        <Text strong>Módulo:</Text>
                        <Select
                            style={{ width: 250 }}
                            value={selectedModule}
                            onChange={setSelectedModule}
                            loading={fetchingModules}
                            placeholder="Selecciona un módulo"
                        >
                            {modules.map(m => (
                                <Select.Option key={m.id} value={m.name}>
                                    {m.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Space>

                    <Divider style={{ margin: "12px 0" }} />

                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        loading={loading}
                        locale={{ emptyText: <Empty description={`No hay registros en la papelera de ${moduleName}`} /> }}
                        pagination={{ pageSize: 10 }}
                    />
                </Space>
            </div>

            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: token.colorError }} />
                        <span>Confirmar eliminación permanente</span>
                    </Space>
                }
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancelar
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        disabled={deleteConfirmText !== "eliminar"}
                        onClick={handlePermanentDelete}
                    >
                        Eliminar
                    </Button>
                ]}
            >
                <div style={{ padding: "10px 0" }}>
                    <Text>
                        Estás a punto de eliminar de forma permanente esta <strong>{moduleName}</strong>. Esta acción no se puede deshacer.
                    </Text>
                    <div style={{ marginTop: 20 }}>
                        <Text type="secondary">Escribe <strong>eliminar</strong> para continuar</Text>
                        <Input
                            placeholder="Escribe 'eliminar' aquí"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default RecycleBin;