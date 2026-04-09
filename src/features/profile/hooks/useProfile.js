import { useState, useEffect } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import profileService from "../services/profileService";

/**
 * Hook to manage profile data and operations.
 */
export const useProfile = (user, profileForm) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const response = await profileService.getProfile(user.id);
          const data = response.data?.data || response.data || response;
          setProfileData(data);

          if (profileForm) {
            profileForm.setFieldsValue({
              ...data,
              birth_date: data.birth_date ? dayjs(data.birth_date) : null,
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          message.error("Error al cargar el perfil");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user?.id, profileForm]);

  const updateProfile = async (values) => {
    try {
      const formattedValues = {
        ...values,
        birth_date: values.birth_date
          ? values.birth_date.format("YYYY-MM-DD")
          : null,
      };

      await profileService.updateProfile(user.id, formattedValues);
      setProfileData((prev) => ({ ...prev, ...formattedValues }));
      setIsEditing(false);
      message.success("Perfil actualizado con éxito");
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Error al actualizar el perfil");
      return false;
    }
  };

  const updatePassword = async (values, email) => {
    try {
      await profileService.resetPassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        email: email,
      });
      message.success("Contraseña actualizada con éxito");
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Error al actualizar la contraseña");
      return false;
    }
  };

  const uploadPhoto = async (file, setUser) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadResponse = await profileService.uploadImage(formData);
      const result = uploadResponse.data;
      const imageUrl = result.url || result.data?.url;

      await profileService.updateProfile(user.id, { photo: imageUrl });

      setProfileData((prev) => ({ ...prev, photo: imageUrl }));
      if (setUser) {
        setUser((prev) => ({ ...prev, photo: imageUrl }));
      }

      message.success("Foto actualizada con éxito");
      return imageUrl;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error al subir la imagen");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    profileData,
    loading,
    uploading,
    isEditing,
    setIsEditing,
    updateProfile,
    updatePassword,
    uploadPhoto,
  };
};
