// hooks/useCrud.js
import { useState, useEffect } from "react";
import { message } from "antd";
import useFetch from "./useFetch";

export const useCrud = (endpoint, titlePlural, filters) => {
    const { request } = useFetch();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchItems = async (page = pagination.current, limit = pagination.pageSize) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search.length >= 3 ? search : undefined,
                ...filters,
            };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
            ).toString();

            const data = await request(`${endpoint}/?${queryParams}`, "GET");

            setItems(data.data || []);
            const total = data.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / limit));
            const current = page > lastPage ? lastPage : page;
            setPagination(prev => ({ ...prev, total, current }));
        } catch (error) {
            console.error(error);
            message.error(`Error al cargar ${titlePlural}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchItems(1), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handlePageChange = (newPage) => fetchItems(newPage);
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }));
        fetchItems(1, newSize);
    };

    return {
        items,
        loading,
        search,
        setSearch,
        pagination,
        fetchItems,
        handlePageChange,
        handlePageSizeChange,
        setItems,
        setPagination,
        request
    };
};