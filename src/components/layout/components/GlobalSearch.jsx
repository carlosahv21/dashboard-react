import React, { useState, useMemo } from "react";
import { Input, message, Avatar } from "antd";
import { SearchOutlined, LoadingOutlined, ClockCircleOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useFetch from "../../../hooks/useFetch";

const GlobalSearch = ({ isDarkMode }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { request, loading } = useFetch();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState({
        students: { data: [], total: 0 },
        teachers: { data: [], total: 0 },
        classes: { data: [], total: 0 }
    });
    const [searchHistory, setSearchHistory] = useState(() => {
        const saved = localStorage.getItem("search_history");
        return saved ? JSON.parse(saved) : [];
    });

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

    const debounceSearch = useMemo(() => {
        let timeout;
        return (term) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
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
                    message.error(t("search.error") || "Error en la búsqueda");
                }
            }, 500);
        };
    }, [request, t]);

    return (
        <div style={{ width: isSearchFocused ? 600 : 400, transition: "width 0.3s ease", zIndex: 101, position: "relative" }}>
            {isSearchFocused && (
                <div 
                    style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.45)", zIndex: -1, backdropFilter: "blur(2px)" }}
                    onClick={() => setIsSearchFocused(false)} 
                />
            )}
            
            <Input
                placeholder={t("menu.search")}
                suffix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
                allowClear
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debounceSearch(e.target.value);
                }}
                style={{
                    borderRadius: 8,
                    height: 40,
                    backgroundColor: isDarkMode ? "#2D2D2D" : "#f5f5f5",
                    border: isSearchFocused ? "2px solid #0A84FF" : "1px solid transparent",
                    color: isDarkMode ? "#fff" : "inherit"
                }}
            />

            {isSearchFocused && (
                <div style={{
                    position: "absolute", top: 56, left: 0, width: "100%", 
                    backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                    borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    maxHeight: "80vh", overflowY: "auto", padding: "12px 0",
                    border: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}`
                }}>
                    {searchQuery.length < 3 ? (
                        <div style={{ padding: "0 20px" }}>
                            {searchHistory.length > 0 ? (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <span style={{ fontSize: 13, color: isDarkMode ? "#fff" : "#111" }}>{t("search.recent")}</span>
                                        <span onClick={clearHistory} style={{ color: "#0A84FF", cursor: "pointer", fontSize: 12 }}>{t("search.clear")}</span>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                        {searchHistory.map((item, i) => (
                                            <div key={i} onClick={() => { setSearchQuery(item); debounceSearch(item); }} 
                                                 style={{ padding: "6px 12px", background: isDarkMode ? "#2D2D2D" : "#f0f2f5", borderRadius: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                                <ClockCircleOutlined style={{ color: "#888" }} />
                                                {item}
                                                <CloseOutlined onClick={(e) => { e.stopPropagation(); removeHistoryItem(item); }} style={{ fontSize: 10, color: "#888" }} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: "center", padding: "20px" }}>
                                    <SearchOutlined style={{ fontSize: 40, color: "#ccc" }} />
                                    <p>{t("search.welcomeTitle")}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {searchResults.students.total === 0 && searchResults.teachers.total === 0 && searchResults.classes.total === 0 ? (
                                <div style={{ textAlign: "center", padding: "20px" }}><p>{t("search.noResults")}</p></div>
                            ) : (
                                <>
                                    <SearchResultSection title={t("menu.students")} items={searchResults.students.data} type="student" isDarkMode={isDarkMode} onSelect={(id) => { addToHistory(searchQuery); navigate(`/students/${id}/history`); setIsSearchFocused(false); }} />
                                    <SearchResultSection title={t("menu.teachers")} items={searchResults.teachers.data} type="teacher" isDarkMode={isDarkMode} onSelect={() => { addToHistory(searchQuery); navigate(`/teachers`); setIsSearchFocused(false); }} />
                                    <SearchResultSection title={t("menu.classes")} items={searchResults.classes.data} type="class" isDarkMode={isDarkMode} onSelect={() => { addToHistory(searchQuery); navigate(`/classes`); setIsSearchFocused(false); }} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SearchResultSection = ({ title, items, type, onSelect, isDarkMode }) => {
    if (!items?.length) return null;
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ padding: "0 16px", fontSize: 10, color: "#888", textTransform: "uppercase" }}>{title}</div>
            {items.slice(0, 5).map(item => (
                <div key={item.id} onClick={() => onSelect(item.id)}
                     style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                     onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? "#2D2D2D" : "#f5f5f5"}
                     onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Avatar size={32} src={item.image || item.photo} icon={type === 'class' ? <ClockCircleOutlined /> : <UserOutlined />} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isDarkMode ? "#E0E0E0" : "#262626" }}>{item.name || `${item.first_name} ${item.last_name}`}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{item.email || item.schedule}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GlobalSearch;
