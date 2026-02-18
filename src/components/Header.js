import React, { useContext, useMemo, useState, useEffect } from "react";
import { Layout, Dropdown, Avatar, Space, Badge, Input, message, Popover, List, Typography, Button, Empty } from "antd";
import { NotificationContext } from "../context/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es"; // Import Spanish locale


import {
    BellOutlined,
    MessageOutlined,
    DownOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SearchOutlined,
    LoadingOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import useFetch from "../hooks/useFetch";
import useFormatting from "../hooks/useFormatting";

const { Header } = Layout;

const isPlanVigent = (plan) => {
    if (!plan || plan.plan_status !== "active") return false;

    const startDate = new Date(plan.plan_start_date);
    const endDate = new Date(plan.plan_end_date);
    const now = new Date();
    return now >= startDate && now <= endDate;
};

const HeaderComponent = ({ searchRef, profileRef, onRestartTour }) => {
    const navigate = useNavigate();
    const { logout, hasPermission, user, settings } = useContext(AuthContext);
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading: notificationsLoading, fetchNotifications } = useContext(NotificationContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({
        students: { data: [], total: 0 },
        teachers: { data: [], total: 0 },
        classes: { data: [], total: 0 }
    });
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchHistory, setSearchHistory] = useState(() => {
        const saved = localStorage.getItem("search_history");
        return saved ? JSON.parse(saved) : [];
    });
    const { request, loading } = useFetch();
    const { formatRelativeTime } = useFormatting();

    const isDarkMode = settings?.theme === "dark";

    const addToHistory = (term) => {
        if (!term.trim()) return;
        const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("search_history");
    };

    const removeHistoryItem = (term) => {
        const newHistory = searchHistory.filter(h => h !== term);
        setSearchHistory(newHistory);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const debounceSearch = useMemo(() => debounce(async (term) => {
        if (!term || term.length < 3) {
            setSearchResults({
                students: { data: [], total: 0 },
                teachers: { data: [], total: 0 },
                classes: { data: [], total: 0 }
            });
            return;
        }

        try {
            const response = await request(`search?q=${term}`);
            if (response.success && response.data) {
                setSearchResults({
                    students: response.data.estudiantes || { data: [], total: 0 },
                    teachers: response.data.profesores || { data: [], total: 0 },
                    classes: response.data.clases || { data: [], total: 0 }
                });
            }
        } catch (error) {
            console.error("Search error:", error);
            message.error(t("search.error") || "Error al realizar la búsqueda");
        }
    }, 500), [request, t]);

    // Scroll effect listener
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        logout();
    };

    const { classesAvailable, isPlanActiveAndVigent } = useMemo(() => {
        const plan = user?.plan;

        let available = 0;
        let activeAndVigent = false;

        if (plan) {
            activeAndVigent = isPlanVigent(plan);

            if (activeAndVigent) {
                available = Math.max(0, plan.max_sessions - plan.plan_classes_used);
            }
        }

        return {
            classesAvailable: available,
            isPlanActiveAndVigent: activeAndVigent,
        };
    }, [user?.plan]);

    const allMenuItems = [
        {
            key: "settings",
            label: t("menu.settings"),
            permission: "settings:view",
            icon: <SettingOutlined />,
            onClick: () => navigate("/settings"),
        },
        {
            key: "logout",
            label: t("menu.logout"),
            danger: true,
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const menuItems = allMenuItems.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <Header
            style={{
                padding: "0 24px",
                backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 10,
                backdropFilter: scrolled ? "blur(8px)" : "none",
                borderBottom: `1px solid ${isDarkMode ? "#2D2D2D" : "#E0E0E0"}`,
            }}
        >
            {/* Backdrop */}
            {isSearchFocused && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        zIndex: 9,
                        backdropFilter: "blur(2px)",
                    }}
                    onClick={() => setIsSearchFocused(false)}
                />
            )}

            {/* Search Bar */}
            <div
                ref={searchRef}
                style={{
                    width: isSearchFocused ? 600 : 400,
                    transition: "width 0.3s ease",
                    zIndex: 11,
                    position: "relative"
                }}
            >
                <Input
                    placeholder={t("menu.search")}
                    suffix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
                    allowClear
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                        const term = e.target.value;
                        setSearchQuery(term);
                        debounceSearch(term);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                            addToHistory(searchQuery);
                            // Optional: navigate to a general search page
                        }
                    }}
                    style={{
                        width: "100%",
                        borderRadius: 8,
                        height: 40,
                        backgroundColor: isDarkMode ? "#2D2D2D" : "#f5f5f5",
                        border: isSearchFocused ? "2px solid #0A84FF" : "1px solid transparent",
                    }}
                />

                {/* Search Results Dropdown */}
                {isSearchFocused && (
                    <div
                        style={{
                            position: "absolute",
                            top: 56,
                            left: 0,
                            width: "100%",
                            backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                            borderRadius: 16,
                            boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.12)",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            padding: "12px 0",
                            border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`,
                            zIndex: 100
                        }}
                    >
                        {searchQuery.length < 3 && (
                            <>
                                {searchQuery.length === 0 && searchHistory.length > 0 ? (
                                    <div style={{ padding: "0 20px 20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                            <span style={{ fontSize: 13, fontWeight: 400, color: isDarkMode ? "#fff" : "#111" }}>
                                                {t("search.recent")}
                                            </span>
                                            <span
                                                onClick={clearHistory}
                                                style={{
                                                    color: "#0A84FF",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight: 400
                                                }}
                                            >
                                                {t("search.clear")}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                            {searchHistory.map((item, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setSearchQuery(item);
                                                        debounceSearch(item);
                                                    }}
                                                    style={{
                                                        padding: "6px 12px",
                                                        backgroundColor: isDarkMode ? "#2D2D2D" : "#f0f2f5",
                                                        borderRadius: 20,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        fontSize: 12,
                                                        fontWeight: 400,
                                                        color: isDarkMode ? "#D9D9D9" : "#333",
                                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        border: "1px solid transparent"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = isDarkMode ? "#3D3D3D" : "#e6e8eb";
                                                        e.currentTarget.style.transform = "translateY(-1px)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = isDarkMode ? "#2D2D2D" : "#f0f2f5";
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                    }}
                                                >
                                                    <ClockCircleOutlined style={{ fontSize: 13, color: "#888" }} />
                                                    {item}
                                                    <CloseOutlined
                                                        style={{ fontSize: 11, marginLeft: 6, color: "#888" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeHistoryItem(item);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: "30px 20px", textAlign: "center" }}>
                                        <SearchOutlined style={{ fontSize: 48, color: isDarkMode ? "#333" : "#f0f0f0", marginBottom: 12 }} />
                                        <div style={{ fontSize: 16, fontWeight: 400, color: isDarkMode ? "#fff" : "#111", marginBottom: 4 }}>
                                            {t("search.welcomeTitle")}
                                        </div>
                                        <div style={{ fontSize: 13, color: "#888", maxWidth: 280, margin: "0 auto" }}>
                                            {t("search.welcomeDesc")}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {searchQuery.length >= 3 && (
                            <>
                                {searchResults.students.total === 0 &&
                                    searchResults.teachers.total === 0 &&
                                    searchResults.classes.total === 0 && !loading ? (
                                    <div style={{ padding: "30px 20px", textAlign: "center" }}>
                                        <CloseCircleOutlined style={{ fontSize: 48, color: isDarkMode ? "#333" : "#f0f0f0", marginBottom: 12 }} />
                                        <div style={{ fontSize: 16, fontWeight: 400, color: isDarkMode ? "#fff" : "#111", marginBottom: 4 }}>
                                            {t("search.noResults")}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <SearchResultSection
                                            title={t("menu.students")}
                                            items={searchResults.students.data}
                                            totalItems={searchResults.students.total}
                                            type="student"
                                            onSelect={(item) => {
                                                addToHistory(searchQuery);
                                                navigate(`/students/${item.id}/history`);
                                                setIsSearchFocused(false);
                                            }}
                                            onViewAll={() => {
                                                navigate(`/students?search=${searchQuery}`);
                                                setIsSearchFocused(false);
                                            }}
                                            isDarkMode={isDarkMode}
                                            t={t}
                                        />
                                        <SearchResultSection
                                            title={t("menu.teachers")}
                                            items={searchResults.teachers.data}
                                            totalItems={searchResults.teachers.total}
                                            type="teacher"
                                            onSelect={(item) => {
                                                addToHistory(searchQuery);
                                                navigate(`/teachers`);
                                                setIsSearchFocused(false);
                                            }}
                                            onViewAll={() => {
                                                navigate(`/teachers?search=${searchQuery}`);
                                                setIsSearchFocused(false);
                                            }}
                                            isDarkMode={isDarkMode}
                                            t={t}
                                        />
                                        <SearchResultSection
                                            title={t("menu.classes")}
                                            items={searchResults.classes.data}
                                            totalItems={searchResults.classes.total}
                                            type="class"
                                            onSelect={(item) => {
                                                addToHistory(searchQuery);
                                                navigate(`/classes`);
                                                setIsSearchFocused(false);
                                            }}
                                            onViewAll={() => {
                                                navigate(`/classes?search=${searchQuery}`);
                                                setIsSearchFocused(false);
                                            }}
                                            isDarkMode={isDarkMode}
                                            t={t}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <Space style={{ marginRight: 0, fontSize: 18 }} size={24}>
                {user?.plan && (
                    <div
                        title={
                            isPlanActiveAndVigent
                                ? t("menu.studentMessage", { classesAvailable })
                                : t("menu.studentMessageExpired")
                        }
                        style={{
                            padding: "6px 12px",
                            backgroundColor: isPlanActiveAndVigent
                                ? isDarkMode
                                    ? "#0A2540"
                                    : "#e6f7ff"
                                : isDarkMode
                                    ? "#2D0F12"
                                    : "#fff1f0",
                            borderRadius: "4px",
                            border: `1px solid ${isPlanActiveAndVigent ? "#91d5ff" : "#ffa39e"
                                }`,
                            fontSize: 14,
                            fontWeight: 500,
                            lineHeight: "20px",
                            cursor: "default",
                            color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit",
                        }}
                    >
                        {t("menu.classesAvailable")}:
                        <span
                            style={{
                                marginLeft: 5,
                                color:
                                    classesAvailable > 0
                                        ? "#52c41a"
                                        : isPlanActiveAndVigent
                                            ? "#faad14"
                                            : "#f5222d",
                                fontSize: 16,
                            }}
                        >
                            {classesAvailable}
                        </span>
                    </div>
                )}

                <Popover
                    trigger="click"
                    placement="bottomRight"
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 500 }}>
                            <Typography.Text strong>{t("notifications.title") || "Notificaciones"}</Typography.Text>
                            {unreadCount > 0 && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={markAllAsRead}
                                    style={{ padding: 0 }}
                                >
                                    {t("notifications.markAllRead") || "Marcar todo leido"}
                                </Button>
                            )}
                        </div>
                    }
                    content={
                        <div style={{ width: 500, maxHeight: 400, overflowY: 'auto' }}>
                            <List
                                loading={notificationsLoading}
                                itemLayout="horizontal"
                                dataSource={notifications.slice(0, 10)}
                                locale={{ emptyText: <Empty description={t("notifications.empty") || "No hay notificaciones"} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                                footer={
                                    notifications.length > 10 && (
                                        <div style={{ textAlign: 'center', marginTop: 12, paddingBottom: 8 }}>
                                            <Button
                                                type="link"
                                                onClick={() => {
                                                    // Close popover logic would need state control here, but navigating works
                                                    navigate("/notifications");
                                                }}
                                            >
                                                {t("notifications.viewAll") || "Ver todas"}
                                            </Button>
                                        </div>
                                    )
                                }
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            !item.is_read && <Button key="read" type="text" size="small" onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }} icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1890ff' }} />} />,
                                            <Button key="delete" type="text" size="small" danger onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }} icon={<CloseOutlined />} />
                                        ]}
                                        style={{
                                            backgroundColor: item.is_read ? 'transparent' : (isDarkMode ? '#2a2a2a' : '#fff'),
                                            padding: '8px 12px',
                                            borderRadius: 4,
                                            marginBottom: 4,
                                            cursor: item.deep_link ? 'pointer' : 'default',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onClick={() => {
                                            if (!item.is_read) markAsRead(item.id);
                                            if (item.deep_link) {
                                                navigate(item.deep_link);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (item.deep_link) {
                                                e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#fff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = item.is_read ? 'transparent' : (isDarkMode ? '#2a2a2a' : '#f0faff');
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={<BellOutlined />}
                                                    style={{ backgroundColor: item.is_read ? (isDarkMode ? '#333' : '#ccc') : '#1890ff' }}
                                                />
                                            }
                                            title={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <Typography.Text
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: item.is_read ? 'normal' : 'bold',
                                                            color: isDarkMode ? '#fff' : 'inherit',
                                                            marginBottom: 0
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary" style={{ fontSize: 10, minWidth: 60, textAlign: 'right', marginLeft: 8 }}>
                                                        {formatRelativeTime(item.created_at)}
                                                    </Typography.Text>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666' }}>{item.body || item.message}</div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    }
                >
                    <Badge count={unreadCount} size="small">
                        <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                    </Badge>
                </Popover>

                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <Space style={{ cursor: "pointer" }} ref={profileRef}>
                        <Avatar size="large" icon={<UserOutlined />} />

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                lineHeight: "1.1",
                            }}
                        >
                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                                {user?.name || t("menu.user")}
                            </span>
                            <span style={{ fontSize: 12, color: "#888" }}>{user?.email}</span>
                        </div>

                        <DownOutlined style={{ fontSize: 12 }} />
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
};

const SearchResultSection = ({ title, items, totalItems, type, onSelect, onViewAll, isDarkMode, t }) => {
    if (!items || items.length === 0) return null;

    const displayItems = items.slice(0, 5);
    const hasMore = totalItems > 5;

    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{
                padding: "0 16px",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <span style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: isDarkMode ? "#888" : "#8c8c8c",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                }}>
                    {title}
                </span>
                {hasMore && (
                    <span
                        style={{ color: "#0A84FF", cursor: "pointer", fontSize: 11, fontWeight: 400 }}
                        onClick={onViewAll}
                    >
                        {t("search.viewAll") || "Ver todo"}
                    </span>
                )}
            </div>
            {displayItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    style={{
                        padding: "6px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? "#2D2D2D" : "#f5f5f5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <Avatar
                        size={32}
                        src={item.image || item.photo}
                        icon={type === 'class' ? <ClockCircleOutlined /> : <UserOutlined />}
                        style={{ backgroundColor: isDarkMode ? "#3D3D3D" : "#f0f2f5" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isDarkMode ? "#E0E0E0" : "#262626",
                            lineHeight: "1.2"
                        }}>
                            {item.name || `${item.first_name} ${item.last_name}`}
                        </span>
                        {item.email && (
                            <span style={{ fontSize: 11, color: "#888", lineHeight: "1.2" }}>{item.email}</span>
                        )}
                        {type === 'class' && item.schedule && (
                            <span style={{ fontSize: 11, color: "#888", lineHeight: "1.2" }}>{item.schedule}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HeaderComponent;
