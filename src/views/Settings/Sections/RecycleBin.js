import React, { useState, useEffect, useCallback, useContext } from "react";
import { Typography, Space, Select, Table, Button, Modal, Input, App, theme, Divider, Empty, Tooltip } from "antd";
import { UndoOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import useFetch from "../../../hooks/useFetch";
import FormHeader from "../../../components/Common/FormHeader";
import dayjs from "dayjs";
import { AuthContext } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const RecycleBin = () => {
    const { t } = useTranslation();
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
            message.error(t('settings.loadModulesError'));
        } finally {
            setFetchingModules(false);
        }
    }, [request, message, t]);

    const fetchData = useCallback(async (moduleName) => {
        if (!moduleName) return;
        setLoading(true);
        try {
            const response = await request(`${moduleName}?onlyDeleted=true`, "GET");

            setData(response.data || []);
        } catch (err) {
            message.error(t('settings.loadRecycleBinError', { moduleName }));
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [request, message, t]);

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
            title: t('settings.restoreTitle'),
            content: t('settings.restoreConfirm', { name: record.name || record.first_name || record.label || record.id }),
            okText: t('settings.restore'),
            cancelText: t('global.cancel'),
            onOk: async () => {
                try {
                    await request(`${selectedModule}/${record.id}/restore`, "PATCH");
                    message.success(t('settings.restoreSuccess'));
                    fetchData(selectedModule);
                } catch (err) {
                    message.error(t('settings.restoreError'));
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
        if (deleteConfirmText !== t('global.deleteKeyword')) return;

        try {
            await request(`${selectedModule}/${recordToDelete.id}`, "DELETE");
            message.success(t('settings.permanentDeleteSuccess'));
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
            fetchData(selectedModule);
        } catch (err) {
            message.error(t('settings.permanentDeleteError'));
        }
    };

    const columns = [
        {
            title: t('students.firstName'),
            key: "name",
            render: (_, record) => {
                const name = record.name || record.label || (record.first_name && `${record.first_name} ${record.last_name}`) || record.id;
                return <Text strong>{name}</Text>;
            }
        },
        {
            title: t('settings.deletedDate'),
            dataIndex: "updated_at",
            key: "updated_at",
            render: (date) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
        },
        {
            title: t('global.actions'),
            key: "actions",
            align: "center",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title={t('settings.restore')}>
                        <Button
                            type="text"
                            icon={<UndoOutlined style={{ color: token.colorSuccess }} />}
                            onClick={() => handleRestore(record)}
                        />
                    </Tooltip>
                    <Tooltip title={t('settings.deletePermanently')}>
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
                title={t('settings.recycle_bin')}
                subtitle={t('settings.recycleBinSubtitle')}
            />

            <div style={{ marginTop: 24 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Space align="center">
                        <Text strong>{t('settings.moduleLabel')}:</Text>
                        <Select
                            style={{ width: 250 }}
                            value={selectedModule}
                            onChange={setSelectedModule}
                            loading={fetchingModules}
                            placeholder={t('settings.selectModulePlaceholder')}
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
                        locale={{ emptyText: <Empty description={t('settings.emptyRecycleBin', { moduleName })} /> }}
                        pagination={{ pageSize: 10 }}
                    />
                </Space>
            </div>

            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: token.colorError }} />
                        <span>{t('settings.permanentDeleteConfirmTitle')}</span>
                    </Space>
                }
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
                        {t('global.cancel')}
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        disabled={deleteConfirmText !== t('global.deleteKeyword')}
                        onClick={handlePermanentDelete}
                    >
                        {t('global.delete')}
                    </Button>
                ]}
            >
                <div style={{ padding: "10px 0" }}>
                    <Text>
                        {t('settings.permanentDeleteConfirmText', { moduleName })}
                    </Text>
                    <div style={{ marginTop: 20 }}>
                        <Text type="secondary">{t('settings.typeToDelete', { keyword: t('global.deleteKeyword') })}</Text>
                        <Input
                            placeholder={t('settings.typeToDeletePlaceholder', { keyword: t('global.deleteKeyword') })}
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