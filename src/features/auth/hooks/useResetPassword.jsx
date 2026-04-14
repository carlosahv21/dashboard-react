import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import authService from "../services/authService";
import { useAuthSlider } from "./useAuthSlider";

/**
 * Hook to manage password reset logic.
 */
export const useResetPassword = (t) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const sliderProps = useAuthSlider(t);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // We use the new GET endpoint to verify the token on mount
                await authService.verifyResetToken(token);
                setIsValid(true);
            } catch (err) {
                const msg = err.response?.data?.message || t("auth.invalidToken");
                message.error(msg);
                setIsValid(false);
            } finally {
                setVerifying(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setVerifying(false);
            setIsValid(false);
        }
    }, [token, t]);

    const handleResetPassword = async (values) => {
        const { password } = values;
        setLoading(true);
        try {
            const response = await authService.resetPassword(token, password);
            message.success(response.data.message || t("auth.passwordResetSuccess"));
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.message || t("auth.genericError");
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        verifying,
        isValid,
        loading,
        ...sliderProps,
        handleResetPassword
    };
};
