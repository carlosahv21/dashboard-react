import React from "react";
import { Input, Button, Space } from "antd";
const { Search } = Input;

const SearchFilter = ({ search, setSearch, onCreate }) => {
    return (
        <Space style={{ marginBottom: 16, display: "flex", justifyContent: "end" }}>
            <Search
                placeholder="Buscar clases"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 200 }}
            />
            <Button type="primary" onClick={onCreate}>
                Crear Clase
            </Button>
        </Space>
    );
};

export default SearchFilter;
