// hooks/useCrud.js
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import useFetch from "./useFetch";

export const useCrud = (
    endpoint,
    titlePlural,
    filters,
    initialSort = { field: null, order: null },
    initialPageSize = 10
) => {
    const { request } = useFetch();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: initialPageSize,
        total: 0,
    });
    const [sort, setSort] = useState(initialSort);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    const fetchItems = useCallback(async (
        page = pagination.current,
        limit = pagination.pageSize,
        currentSort = sort
    ) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search.length >= 3 ? search : undefined,
                order_by: currentSort.field,
                order_direction:
                    currentSort.order === "ascend"
                        ? "asc"
                        : currentSort.order === "descend"
                            ? "desc"
                            : undefined,
                ...filters,
            };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(
                    ([_, v]) => v !== undefined && v !== "" && v !== null
                )
            ).toString();

            const response = await request(`${endpoint}/?${queryParams}`, "GET");
            const items = response.data;
            const paginationData = response.pagination;

            setItems(items || []);
            const total = paginationData.total || 0;
            const lastPage = Math.max(1, Math.ceil(total / limit));
            const current = page > lastPage ? lastPage : page;
            setPagination((prev) => ({ ...prev, total, current, pageSize: limit }));
        } catch (error) {
            console.error(error);
            message.error(`Error al cargar ${titlePlural}`);
        } finally {
            setLoading(false);
        }
    }, [endpoint, titlePlural, filters, search, sort, pagination.current, pagination.pageSize, request]);

    useEffect(() => {
        const delay = setTimeout(
            () => fetchItems(1, pagination.pageSize, sort),
            500
        );
        return () => clearTimeout(delay);
    }, [search, fetchItems, pagination.pageSize, sort]);

    useEffect(() => {
        if (isAllSelected) {
            const newIds = items.map((i) => i.id);
            setSelectedKeys((prev) => {
                const unique = new Set([...prev, ...newIds]);
                if (unique.size !== prev.length) return [...unique];
                return prev;
            });
        }
    }, [items, isAllSelected]);

    const handleTableChange = (newPagination, filters, sorter) => {
        const newSort = {
            field: sorter.field,
            order: sorter.order,
        };
        setSort(newSort);
        const currentSize = pagination.pageSize;
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchItems(1, currentSize, newSort);
    };

    const handlePageChange = (newPage) => fetchItems(newPage);
    const handlePageSizeChange = (newSize) => {
        setPagination((prev) => ({ ...prev, pageSize: newSize, current: 1 }));
        fetchItems(1, newSize);
    };

    const getAllItems = async () => {
        try {
            const params = {
                page: 1,
                limit: 10000,
                search: search.length >= 3 ? search : undefined,
                order_by: sort.field,
                order_direction:
                    sort.order === "ascend"
                        ? "asc"
                        : sort.order === "descend"
                            ? "desc"
                            : undefined,
                ...filters,
            };
            const queryParams = new URLSearchParams(
                Object.entries(params).filter(
                    ([_, v]) => v !== undefined && v !== "" && v !== null
                )
            ).toString();

            const response = await request(`${endpoint}/?${queryParams}`, "GET");
            return response.data || [];
        } catch (error) {
            console.error(error);
            message.error(`Error al exportar ${titlePlural}`);
            return [];
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedKeys((prev) => [...prev, id]);
        } else {
            setSelectedKeys((prev) => prev.filter((k) => k !== id));
            if (isAllSelected) setIsAllSelected(false);
        }
    };

    const handleSelectAll = (checked) => {
        setIsAllSelected(checked);
        if (checked) {
            const allIdsOnPage = items.map((i) => i.id);
            setSelectedKeys((prev) => [...new Set([...prev, ...allIdsOnPage])]);
        } else {
            setSelectedKeys([]);
        }
    };

    const handleDelete = async (id, titleSingular) => {
        try {
            await request(`${endpoint}/${id}/bin`, "PATCH");
            message.success(`Registro de ${titleSingular} eliminado correctamente`);
            setItems((prev) => prev.filter((i) => i.id !== id));
            setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
            return true;
        } catch (error) {
            message.error(error?.message || `Error al eliminar ${titleSingular}`);
            return false;
        }
    };

    const handleBulkDelete = (modal, t) => {
        if (selectedKeys.length === 0) {
            message.warning(t('global.noSelectionDelete'));
            return;
        }

        modal.confirm({
            title: t('global.bulkDeleteTitle', { count: isAllSelected ? t('global.all') : selectedKeys.length }),
            content: t('global.bulkDeleteConfirm', { count: isAllSelected ? pagination.total : selectedKeys.length }),
            okText: t('global.yesDelete'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: async () => {
                const hide = message.loading(t('global.deleting'), 0);
                try {
                    let idsToDelete = selectedKeys;
                    if (isAllSelected) {
                        const allItemsData = await getAllItems();
                        idsToDelete = allItemsData.map(i => i.id);
                    }

                    for (let i = 0; i < idsToDelete.length; i += 5) {
                        const chunk = idsToDelete.slice(i, i + 5);
                        await Promise.all(
                            chunk.map((id) => request(`${endpoint}/${id}`, "DELETE"))
                        );
                    }

                    message.success(t('global.bulkDeleteSuccess'));
                    fetchItems();
                    setSelectedKeys([]);
                    handleSelectAll(false);
                } catch (error) {
                    console.error(error);
                    message.error(t('global.bulkDeleteError'));
                } finally {
                    hide();
                }
            },
        });
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
        handleTableChange,
        sort,
        setItems,
        setPagination,
        request,
        getAllItems,
        handleDelete,
        handleBulkDelete,
        // Selection
        selectedKeys,
        setSelectedKeys,
        isAllSelected,
        setIsAllSelected,
        handleSelectRow,
        handleSelectAll,
    };
};
