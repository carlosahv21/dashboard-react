// components/SearchFilter.jsx (Con Alineación Vertical y Botón de Exportar)
import React from "react";
import { Input, Button, Space, Select, Typography } from "antd";
import { UploadOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

const SearchFilter = ({
    search,
    setSearch,
    onCreate,
    title,
    titlePlural,
    canCreate,
    pageSize,
    onPageSizeChange,
    onExport,
    canExport = true,
}) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 16
        }}>

            <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
                {titlePlural}
            </Title>

            <Space>
                <Space size={5}>
                    <Typography.Text type="secondary">Mostrar</Typography.Text>
                    <Select
                        value={pageSize}
                        style={{ width: 60 }}
                        onChange={onPageSizeChange}
                        options={[
                            { value: 5, label: '5' },
                            { value: 10, label: '10' },
                            { value: 20, label: '20' },
                            { value: 50, label: '50' },
                            { value: 100, label: '100' },
                        ]}
                    />
                </Space>

                <Input
                    placeholder={`Buscar ${title.toLowerCase()}`}
                    allowClear
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 250 }}
                    suffix={<SearchOutlined />}
                />

                {canExport && (
                    <Button onClick={onExport} icon={<UploadOutlined />}>
                        Exportar
                    </Button>
                )}

                {canCreate && (
                    <Button type="primary" onClick={onCreate} icon={<PlusOutlined />}>
                        Crear {title}
                    </Button>
                )}
            </Space>

        </div>
    );
};

export default SearchFilter;