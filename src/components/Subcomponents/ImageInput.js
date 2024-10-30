import React from "react";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ImageInput = ({ name, customRequest, onRemove, onImageUpload }) => (
    <Upload
        listType="picture-card"
        showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
        maxCount={1}
        multiple={false}
        customRequest={customRequest}
        onRemove={onRemove}
        onPreview={(file) => {
            const src = file.url || file.preview;
            const imgWindow = window.open(src);
            imgWindow.document.write(`<img src="${src}" style="max-width:100%;" />`);
        }}
        onImageUpload={onImageUpload}
    >
        <button style={{ border: 0, background: 'none' }} type="button">
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    </Upload>
);

export default ImageInput;
