import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import useFetch from '../hooks/useFetch';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const { request } = useFetch();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await request('notifications');
            const data = response.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [request, user]);

    const markAsRead = async (id) => {
        try {
            await request(`notifications/${id}/read`, 'PATCH');
            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await request('notifications/read-all', 'PATCH');
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await request(`notifications/${id}`, 'DELETE');
            setNotifications(prev => {
                const newNotifications = prev.filter(n => n.id !== id);
                setUnreadCount(newNotifications.filter(n => !n.is_read).length);
                return newNotifications;
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Set up polling or websocket here
            const interval = setInterval(fetchNotifications, 60000); // Poll every minute
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
