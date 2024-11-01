import React from "react";
import { Form, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/useFetch"; // Importa el hook useFetch

const { Option } = Select;

const DynamicInput = ({ label, name, type, options, form, rules, onImageUpload }) => {
    const { request } = useFetch(); // Usa el hook useFetch para manejar las peticiones

    const handleRemoveImage = async (file) => {
        try {
            const data = await request(`images/delete`, "DELETE", { imageUrl: file.url || file.response.url });
            message.success("Image removed successfully");
            form.setFieldsValue({ [name]: null });
            if (onImageUpload) onImageUpload(null); // Limpia la URL en el componente padre
        } catch (error) {
            message.error("Failed to remove image");
        }
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append("logo", file);

        try {
            const data = await request("images/upload", "POST", formData);
            form.setFieldsValue({ [name]: data.url });
            if (onImageUpload) onImageUpload(data.url); // Pasa la URL al componente padre
            onSuccess(data);
        } catch (error) {
            message.error("Failed to upload image");
            onError(error);
        }
    };

    return (
        <Form.Item
            label={label}
            name={name}
            rules={rules}
        >
            {type === "text" && <Input />}
            {type === "number" && <Input type="number" />}
            {type === "select" && (
                <Select>
                    {options?.map((option) => (
                        <Option key={option.value} value={option.value}>
                            {option.label}
                        </Option>
                    ))}
                </Select>
            )}
            {type === "image" && (
                <Upload
                    listType="picture-card"
                    showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
                    maxCount={1}
                    multiple={false}
                    customRequest={customRequest}
                    onRemove={handleRemoveImage}
                    onPreview={(file) => {
                        const src = file.url || file.preview;
                        const imgWindow = window.open(src);
                        imgWindow.document.write(
                            `<img src="${src}" style="max-width:100%;" />`
                        );
                    }}
                >
                    <button style={{ border: 0, background: "none" }} type="button">
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </button>
                </Upload>
            )}
        </Form.Item>
    );
};

export default DynamicInput;
