// hooks/useDrawerDetail.js
import { useState } from 'react';
import { message } from 'antd';

export const useDrawerDetail = (request, endpoint, titleSingular) => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [drawerData, setDrawerData] = useState(null);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const fetchDetailForDrawer = async (id) => {
        if (!id) return;
        
        setDrawerLoading(true);
        setDrawerData(null);
        setDrawerVisible(true);
        
        try {
            const response = await request(`${endpoint}/details/${id}`, "GET");
            setDrawerData(response.data);
        } catch (error) {
            console.error("Error fetching detail:", error);
            message.error(`Error al cargar los detalles de ${titleSingular}`);
            setDrawerVisible(false);
        } finally {
            setDrawerLoading(false);
        }
    };
    
    const handleRowClick = (record) => {
        setSelectedRecordId(record.id);
        fetchDetailForDrawer(record.id);
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
        setDrawerData(null);
        setSelectedRecordId(null);
    };

    return {
        drawerVisible,
        selectedRecordId,
        drawerData,
        drawerLoading,
        handleRowClick,
        handleDrawerClose
    };
};