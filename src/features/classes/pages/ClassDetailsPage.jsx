import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Row, Col, Typography, Spin, message, Button, 
  Card, Statistic, Table, Tag, Divider, Space, Avatar, theme, Modal, Form 
} from "antd";
import { 
  LeftOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  EnvironmentOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../context/AuthContext";
import classService from "../services/classService";
import { useFormModal } from "../../../hooks/useFormModal";
import FormHeader from "../../../components/Common/FormHeader";
import FormFooter from "../../../components/Common/FormFooter";
import FormSection from "../../../components/Common/FormSection";
import SupportCard from "../../profile/components/SupportCard";

const { Title, Text } = Typography;

const ClassProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { settings } = React.useContext(AuthContext);
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);

  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await classService.getClassDetails(id);
      const data = response.data?.data || response.data || response;
      setClassData(data);
    } catch (error) {
      console.error("Error fetching class details:", error);
      message.error(t("global.error_fetching"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) fetchClassData();
  }, [id, fetchClassData]);

  // Modal de edición - moduleFieldId para clases es 19 según la query del error previa o similar, 
  // pero normalmente coincide con el endpoint. Revisando AppRouter o BaseView...
  // En BaseView se usa moduleFieldId que se pase. En ClassPage no se pasaba, así que usaba 'classes'.
  const { modalVisible, moduleData, openModal, closeModal, handleSubmit } = useFormModal(
    "classes", "classes", t('classes.name_singular'), {}, form
  );

  const handleEditSubmit = async (values) => {
    const success = await handleSubmit(values);
    if (success) fetchClassData();
  };

  if (loading || !classData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const { header, stats, session_details, students } = classData;

  const studentColumns = [
    {
      title: t('students.name_singular'),
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space onClick={() => navigate(`/students/${record.id}/profile`)} style={{ cursor: 'pointer' }}>
          <Avatar 
            size="small"
            icon={<TeamOutlined />} 
            style={{ backgroundColor: "rgba(10, 132, 255, 0.1)", color: token.colorPrimary }} 
          />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
        title: t('students.plan'),
        dataIndex: 'plan_info',
        key: 'plan_info',
        render: (plan) => <Text type="secondary" style={{ fontSize: '13px' }}>{plan}</Text>
    },
    {
      title: t('attendances.status'),
      dataIndex: 'has_attended',
      key: 'has_attended',
      align: 'right',
      render: (hasAttended) => (
        <Tag 
            color={hasAttended ? "green" : "default"} 
            style={{ borderRadius: 12, border: 'none', padding: '0 10px' }}
        >
          {hasAttended ? t('attendances.present') : t('attendances.pending')}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Page Header with Back Button and Top Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={() => navigate("/classes")} 
            style={{ marginRight: 12 }}
          />
          <Title level={3} style={{ margin: 0 }}>{t('global.detail', { title: t('classes.name_singular') })}</Title>
        </div>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => openModal(id)}
          style={{ borderRadius: 8 }}
        >
          {t('global.edit')}
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: Header and Student List */}
        <Col xs={24} lg={16}>
          {/* Class "Profile" Header Card (Reuse Profile Style) */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div
              style={{
                height: 120,
                background: token.colorPrimary,
                position: "relative",
              }}
            />
            <div style={{ padding: "0 32px 32px", marginTop: -40, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: 'wrap' }}>
                <div style={{ 
                  padding: 4, 
                  background: "#fff", 
                  borderRadius: 12, 
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)" 
                }}>
                  <Avatar
                    size={100}
                    shape="square"
                    icon={<ProjectOutlined />}
                    style={{ 
                        backgroundColor: "#f0f2f5", 
                        color: token.colorPrimary,
                        borderRadius: 8
                    }}
                  />
                </div>
                <div style={{ flex: 1, paddingBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <Title level={2} style={{ margin: 0, color: '#333' }}>{header.title}</Title>
                    </div>
                    <Text type="secondary">{header.level_tag}</Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Students List */}
          <Card 
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space><TeamOutlined /> {t('students.name_plural')}</Space>
                    <Tag color="cyan" style={{ borderRadius: 10 }}>{students.length} {t('global.total')}</Tag>
                </div>
            }
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              columns={studentColumns} 
              dataSource={students} 
              pagination={{ pageSize: 10, size: 'small' }} 
              rowKey="id"
              locale={{ emptyText: t('global.noData') }}
            />
          </Card>
        </Col>

        {/* RIGHT COLUMN: Stats and Session Details */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Stats Section in a Row with Dividers */}
            <Card 
                title={<Space><ProjectOutlined /> {t('dashboard.stats')}</Space>}
                bordered={false}
                style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                bodyStyle={{ padding: '24px 16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {stats.map((s, idx) => (
                  <React.Fragment key={idx}>
                    <Statistic 
                        title={<Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>}
                        value={s.value} 
                        valueStyle={{ color: token.colorPrimary, fontWeight: 'bold', fontSize: 20 }} 
                    />
                    {idx < stats.length - 1 && <Divider type="vertical" style={{ height: 40, margin: '0 8px' }} />}
                  </React.Fragment>
                ))}
              </div>
            </Card>

            {/* Session Details */}
            <Card 
                title={<Space><ClockCircleOutlined /> {t('classes.session_info')}</Space>}
                bordered={false}
                style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">{t('global.time')}</Text>
                    <Text strong>{session_details.time_range}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">{t('global.duration')}</Text>
                    <Text>{session_details.duration_label}</Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <Space align="start">
                    <Avatar 
                        shape="square" 
                        icon={<EnvironmentOutlined />} 
                        style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', color: token.colorPrimary }} 
                    />
                    <div>
                        <Text strong style={{ display: 'block' }}>{session_details.location}</Text>
                        <Text type="secondary" size="small">{session_details.location_detail}</Text>
                    </div>
                </Space>
              </Space>
            </Card>

            {/* Support Section */}
            <SupportCard settings={settings} t={t} />
          </Space>
        </Col>
      </Row>

      {/* Modal de Pago / Edición de Clase */}
      <Modal open={modalVisible} footer={null} width={800} onCancel={() => closeModal(false)} destroyOnClose>
          {moduleData ? (
              <>
                  <FormHeader 
                    title={t('global.editTitle', { title: t('classes.name_singular') })} 
                    onSave={() => form.submit()} 
                    onCancel={() => closeModal(false)} 
                  />
                  <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ padding: 20 }}>
                      {moduleData.blocks?.map(block => (
                          <FormSection
                              key={block.block_id}
                              title={block.block_name}
                              fields={block.fields}
                          />
                      ))}
                      <FormFooter onCancel={() => closeModal(false)} onSave={() => form.submit()} />
                  </Form>
              </>
          ) : <div style={{ padding: 50, textAlign: 'center' }}><Spin /></div>}
      </Modal>
    </div>
  );
};

export default ClassProfilePage;
