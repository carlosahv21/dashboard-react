import React from "react";
import { Layout } from "antd";

const { Footer } = Layout; // Usamos Footer, no Foo

const FooterComponent = () => {
  return (
    <Footer style={{ textAlign: 'center', padding: '20px' }}>
      Ant Design ©{new Date().getFullYear()} Created by Ant UED
    </Footer>
  );
};

export default FooterComponent;
