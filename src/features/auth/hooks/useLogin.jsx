import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuthSlider } from "./useAuthSlider";

/**
 * Hook to manage login logic.
 */
export const useLogin = (loginContext, t) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const sliderProps = useAuthSlider(t);

  const handleLogin = async (values) => {
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(values);
      const result = response.data;

      if (!result || !result.success || !result.data?.token) {
        message.error(t("auth.invalidCredentials"));
        setError(t("auth.invalidCredentials"));
        return;
      }

      loginContext(result.data);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        t("auth.genericError");
      message.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      message.success(response.data.message);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("auth.genericError");
      message.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (token, password) => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      message.success(response.data.message);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("auth.genericError");
      message.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    ...sliderProps,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
  };
};
