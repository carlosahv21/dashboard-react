import React, { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { useFormModal } from '../../hooks/useFormModal';
import BaseFormModal from './BaseFormModal';

const QuickCreateModal = ({ visible, endpoint, moduleFieldId, titleSingular, fixedValues, hiddenFields, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const {
        modalVisible,
        moduleData,
        openModal,
        closeModal,
        handleSubmit
    } = useFormModal(endpoint, moduleFieldId, titleSingular, fixedValues, form);

    const prevVisible = useRef(visible);

    useEffect(() => {
        if (visible && !prevVisible.current) {
            openModal();
        } else if (!visible && prevVisible.current) {
            closeModal(false);
        }
        prevVisible.current = visible;
    }, [visible, openModal, closeModal]);

    const handleFinish = async (values) => {
        try {
            const result = await handleSubmit(values);
            if (result) {
                // Return result if it's an object with data, otherwise pass fallback true
                if (typeof result === 'object' && Object.keys(result).length > 0) {
                    onSuccess(result);
                } else {
                    onSuccess(true);
                }
            }
        } catch (e) {
            console.error("Error Quick Create:", e);
        }
    };

    return (
        <BaseFormModal
            visible={modalVisible && visible}
            editingId={null}
            moduleData={moduleData}
            titleSingular={titleSingular}
            hiddenFields={hiddenFields}
            form={form}
            onCancel={() => {
                closeModal(false);
                onCancel();
            }}
            onFinish={handleFinish}
        />
    );
};

export default QuickCreateModal;
