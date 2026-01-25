import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Tour, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';

/**
 * AppOnboarding Component
 */
const AppOnboarding = forwardRef(({ customSteps = [] }, ref) => {
    const { t } = useTranslation();
    const {
        isOpen,
        currentStep,
        setCurrentStep,
        completeStep,
        closeTour,
        skipTour
    } = useOnboarding();

    // Mark current step when it changes or opens
    useEffect(() => {
        if (isOpen) {
            completeStep(currentStep);
        }
    }, [isOpen, currentStep, completeStep]);

    useImperativeHandle(ref, () => ({
        startTour: (index = 0) => {
            setCurrentStep(index);
        }
    }));

    const handleChange = (step) => {
        setCurrentStep(step);
    };

    const defaultSteps = [
        {
            title: t('onboarding.welcome.title', '¡Bienvenido!'),
            description: t('onboarding.welcome.desc', 'Te daremos un breve recorrido por las funciones principales.'),
            cover: (
                <img
                    alt="welcome"
                    src="https://gw.alipayobjects.com/zos/rmsportal/rkNByYPwSox9KNq9.png"
                    style={{ width: '100%' }}
                />
            ),
            target: null,
        },
        {
            title: t('onboarding.sidebar.title', 'Navegación'),
            description: t('onboarding.sidebar.desc', 'Accede fácilmente a todas las secciones desde el menú lateral.'),
            target: () => document.getElementById('sidebar-menu'),
        },
        {
            title: t('onboarding.search.title', 'Buscador'),
            description: t('onboarding.search.desc', 'Encuentra lo que necesites rápidamente.'),
            target: () => document.getElementById('header-search'),
        },
        {
            title: t('onboarding.profile.title', 'Tu Perfil'),
            description: t('onboarding.profile.desc', 'Configura tu cuenta y cierra sesión aquí.'),
            target: () => document.getElementById('user-profile-menu'),
        },
        {
            title: t('onboarding.finish.title', '¡Listo!'),
            description: t('onboarding.finish.desc', 'Disfruta de tu nuevo dashboard. Puedes repetir el tour si lo deseas.'),
            target: null,
        },
    ];

    const tourSteps = customSteps.length > 0 ? customSteps : defaultSteps;

    return (
        <Tour
            open={isOpen}
            onClose={closeTour}
            onChange={handleChange}
            current={currentStep}
            steps={tourSteps}
            mask={true}
            arrow={true}
            actionsRender={(originNode, { current, total }) => (
                <div style={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                    {current !== total - 1 && (
                        <Button
                            size="small"
                            type="default"
                            onClick={skipTour}
                        >
                            {t('onboarding.skip', 'Saltar tour')}
                        </Button>
                    )}
                    {originNode}
                </div>
            )}
        />
    );
});

export default AppOnboarding;
