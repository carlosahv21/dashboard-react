import React, { createContext, useState, useEffect, useContext } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isWidgetHidden, setIsWidgetHidden] = useState(false);

    // Key for localStorage persistence
    const STORAGE_KEY = 'app_onboarding_progress';
    const COMPLETED_KEY = 'app_tour_completed';
    const HIDDEN_KEY = 'app_onboarding_hidden';

    // Load initial state from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            setCompletedSteps(JSON.parse(savedProgress));
        }

        const isHidden = localStorage.getItem(HIDDEN_KEY);
        if (isHidden === 'true') {
            setIsWidgetHidden(true);
        }

        const isFullyCompleted = localStorage.getItem(COMPLETED_KEY);
        if (!isFullyCompleted && isHidden !== 'true') {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Save completed steps to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    }, [completedSteps]);

    const completeStep = (index) => {
        if (!completedSteps.includes(index)) {
            const nextCompleted = [...completedSteps, index];
            setCompletedSteps(nextCompleted);

            if (nextCompleted.length === 5) {
                localStorage.setItem(COMPLETED_KEY, 'true');
            }
        }
    };

    const skipTour = () => {
        setCompletedSteps([0, 1, 2, 3, 4]);
        setIsOpen(false);
        localStorage.setItem(COMPLETED_KEY, 'true');
    };

    const hideWidgetPermanently = () => {
        setIsWidgetHidden(true);
        localStorage.setItem(HIDDEN_KEY, 'true');
    };

    const resetOnboarding = () => {
        setCompletedSteps([]);
        setCurrentStep(0);
        setIsOpen(true);
        setIsWidgetHidden(false);
        localStorage.removeItem(COMPLETED_KEY);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIDDEN_KEY);
    };

    const closeTour = () => {
        setIsOpen(false);
        // Mark as completed so it doesn't auto-start again
        localStorage.setItem(COMPLETED_KEY, 'true');
    };

    const startTour = (stepIndex = 0) => {
        setCurrentStep(stepIndex);
        setIsOpen(true);
        completeStep(stepIndex);
    };

    const progressPercentage = Math.round((completedSteps.length / 5) * 100);

    const value = {
        currentStep,
        setCurrentStep,
        completedSteps,
        completeStep,
        isOpen,
        setIsOpen,
        isWidgetHidden,
        hideWidgetPermanently,
        closeTour,
        startTour,
        skipTour,
        resetOnboarding,
        progressPercentage,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};
