import { useState } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import useFetch from './useFetch';

export const useDrawerDetail = (endpoint, titleSingular) => {
    const { request } = useFetch();
    const { t } = useTranslation();
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
            message.error(t('global.detailLoadError', { entity: titleSingular }));
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