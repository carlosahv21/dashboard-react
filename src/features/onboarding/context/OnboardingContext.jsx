import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const OnboardingContext = createContext();

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isWidgetHidden, setIsWidgetHidden] = useState(false);
    const [isTourFinished, setIsTourFinished] = useState(false);

    // Key for localStorage persistence
    const STORAGE_KEY = 'app_onboarding_progress';
    const COMPLETED_KEY = 'app_tour_completed';
    const HIDDEN_KEY = 'app_onboarding_hidden';

    // Load initial state from localStorage and user profile
    useEffect(() => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            setCompletedSteps(JSON.parse(savedProgress));
        }

        // Check if tour is completed in user profile or localStorage
        const userTourCompleted = user?.tour_completed === true;
        const localTourCompleted = localStorage.getItem(COMPLETED_KEY) === 'true';
        const finished = userTourCompleted || localTourCompleted;
        
        setIsTourFinished(finished);

        // Check if widget is hidden in user profile or localStorage
        const userHideTour = user?.hide_tour === true;
        const localHideTour = localStorage.getItem(HIDDEN_KEY) === 'true';
        const isHidden = userHideTour || localHideTour;

        setIsWidgetHidden(isHidden);

        // Auto-open tour if not finished and not hidden
        if (!finished && !isHidden) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Save completed steps to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    }, [completedSteps]);

    const completeStep = (index) => {
        if (!completedSteps.includes(index)) {
            const nextCompleted = [...completedSteps, index];
            setCompletedSteps(nextCompleted);

            if (nextCompleted.length === 5) {
                markTourAsCompleted();
            }
        }
    };

    const markTourAsCompleted = async () => {
        localStorage.setItem(COMPLETED_KEY, 'true');
        setIsTourFinished(true);
        // The user asked to update "app_tour_completed" twice, which might be a typo for another variable, 
        // but we'll ensure it's set and also update the backend.
        if (user && !user.tour_completed) {
            await updateUser({ tour_completed: true });
        }
    };

    const skipTour = () => {
        setCompletedSteps([0, 1, 2, 3, 4]);
        setIsOpen(false);
        markTourAsCompleted();
    };

    const hideWidgetPermanently = async () => {
        setIsWidgetHidden(true);
        localStorage.setItem(HIDDEN_KEY, 'true');
        if (user && !user.hide_tour) {
            await updateUser({ hide_tour: true });
        }
    };

    const resetOnboarding = async () => {
        setCompletedSteps([]);
        setCurrentStep(0);
        setIsOpen(true);
        setIsWidgetHidden(false);
        localStorage.removeItem(COMPLETED_KEY);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIDDEN_KEY);
        
        // Reset in backend too if needed
        if (user) {
            await updateUser({ tour_completed: false, hide_tour: false });
        }
    };

    const closeTour = () => {
        setIsOpen(false);
        // Mark as completed so it doesn't auto-start again (as requested: update when closing modal)
        markTourAsCompleted();
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
        isTourFinished,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};
