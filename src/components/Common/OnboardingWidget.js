import React, { useState } from 'react';
import { Popover, Progress, List, Checkbox, Button, Typography, Space, Divider, Tooltip } from 'antd';
import { RocketOutlined, PlayCircleOutlined, RedoOutlined, RightOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const OnboardingWidget = () => {
    const {
        progressPercentage,
        completedSteps,
        startTour,
        resetOnboarding,
        isWidgetHidden,
        hideWidgetPermanently
    } = useOnboarding();
    const [popoverVisible, setPopoverVisible] = useState(false);
    const { t } = useTranslation();

    // Do not show if manually hidden
    if (isWidgetHidden) return null;

    const stepsData = [
        { title: t('onboarding.welcome.title', 'Bienvenida'), index: 0 },
        { title: t('onboarding.sidebar.title', 'Navegación'), index: 1 },
        { title: t('onboarding.search.title', 'Buscador'), index: 2 },
        { title: t('onboarding.profile.title', 'Mi Perfil'), index: 3 },
        { title: t('onboarding.finish.title', 'Finalizar'), index: 4 },
    ];

    const checklistContent = (
        <div style={{ width: 320 }}>
            <div style={{ padding: '8px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 16 }}>{t('onboarding.widget.title', 'Progreso de Configuración')}</Text>
                    <Tooltip title={t('onboarding.widget.hidePermanent', 'Ocultar widget siempre')}>
                        <Button
                            type="text"
                            icon={<EyeInvisibleOutlined />}
                            onClick={hideWidgetPermanently}
                            size="small"
                        />
                    </Tooltip>
                </div>
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <Progress
                        percent={progressPercentage}
                        status={progressPercentage === 100 ? 'success' : 'active'}
                        strokeColor={progressPercentage === 100 ? '#52c41a' : '#1890ff'}
                    />
                </div>
            </div>

            <List
                size="small"
                dataSource={stepsData}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button
                                type="text"
                                size="small"
                                icon={completedSteps.includes(item.index) ? <RedoOutlined /> : <PlayCircleOutlined />}
                                onClick={() => {
                                    startTour(item.index);
                                    setPopoverVisible(false);
                                }}
                            >
                                {completedSteps.includes(item.index) ? t('common.repeat', 'Repetir') : t('common.go', 'Ir')}
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Checkbox checked={completedSteps.includes(item.index)} disabled />}
                            title={<Text style={{ fontSize: 13 }} delete={completedSteps.includes(item.index)}>{item.title}</Text>}
                        />
                    </List.Item>
                )}
            />

            <Divider style={{ margin: '12px 0' }} />

            <Button
                block
                type="dashed"
                size="small"
                onClick={() => resetOnboarding()}
            >
                {t('onboarding.widget.reset', 'Reiniciar todo el tour')}
            </Button>
        </div>
    );

    return (
        <div style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            gap: 12
        }}>
            <Popover
                content={checklistContent}
                title={null}
                trigger="click"
                placement="topLeft"
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
            >
                <div
                    style={{
                        borderRadius: 30,
                        padding: '6px 16px',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                        border: '1px solid #e8e8e8',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        transition: 'all 0.3s'
                    }}
                    className="onboarding-pill"
                    onClick={() => setPopoverVisible(!popoverVisible)}
                >
                    <div style={{
                        background: progressPercentage === 100 ? '#52c41a' : '#1890ff',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 16
                    }}>
                        <RocketOutlined />
                    </div>

                    <div style={{ width: 120 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text size="small" type="secondary" style={{ fontSize: 10 }}>Progreso</Text>
                            <Text strong style={{ fontSize: 10 }}>{progressPercentage}%</Text>
                        </div>
                        <Progress
                            percent={progressPercentage}
                            size={[120, 4]}
                            showInfo={false}
                            strokeColor={progressPercentage === 100 ? '#52c41a' : '#1890ff'}
                        />
                    </div>

                    <Divider type="vertical" style={{ height: 20, margin: 0 }} />

                    <Tooltip title={t('onboarding.widget.viewMore', 'Ver tareas')}>
                        <Button
                            type="text"
                            shape="circle"
                            size="small"
                            icon={<RightOutlined />}
                            style={{ color: '#8c8c8c' }}
                        />
                    </Tooltip>
                </div>
            </Popover>
        </div>
    );
};

export default OnboardingWidget;
