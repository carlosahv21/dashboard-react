import React from "react";
import { Modal, Form, Spin } from "antd";
import FormHeader from "./FormHeader";
import FormSection from "./FormSection";
import FormFooter from "./FormFooter";
import { useTranslation } from "react-i18next";

const BaseFormModal = ({
    visible,
    editingId,
    moduleData,
    titleSingular,
    hiddenFields,
    form,
    onCancel,
    onFinish,
    loading = false
}) => {
    const { t } = useTranslation();

    return (
        <Modal
            open={visible}
            title={null}
            footer={null}
            width={800}
            onCancel={onCancel}
            destroyOnClose
        >
            {moduleData ? (
                moduleData.blocks?.length > 0 ? (
                    <>
                        <FormHeader
                            title={
                                editingId
                                    ? t('global.editTitle', { title: titleSingular })
                                    : t('global.createTitle', { title: titleSingular })
                            }
                            subtitle={
                                editingId
                                    ? t('global.editSubtitle', { title: titleSingular.toLowerCase() })
                                    : t('global.createSubtitle', { title: titleSingular.toLowerCase() })
                            }
                            onSave={() => form.submit()}
                            onCancel={onCancel}
                            loading={loading}
                        />
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            style={{ padding: "0 10px" }}
                        >
                            {moduleData.blocks.map((block) => (
                                <FormSection
                                    key={block.block_id}
                                    title={block.block_name}
                                    fields={block.fields.filter(
                                        (f) => !hiddenFields?.includes(f.name)
                                    )}
                                    form={form}
                                />
                            ))}
                            <FormFooter
                                onCancel={onCancel}
                                onSave={() => form.submit()}
                                loading={loading}
                            />
                        </Form>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: 50 }}>
                        {t('global.noFields')}
                    </div>
                )
            ) : (
                <div style={{ textAlign: "center", padding: 50 }}>
                    <Spin /> <p>{t('global.loadingFields')}</p>
                </div>
            )}
        </Modal>
    );
};

export default BaseFormModal;
