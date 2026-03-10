import { useState, useEffect, useContext } from 'react';
import useFetch from './useFetch';
import { AuthContext } from '../context/AuthContext';

export const useNotificationsSidebarData = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { request } = useFetch();

    // Data states
    const [agendaData, setAgendaData] = useState([]);
    const [middleData, setMiddleData] = useState(null);
    const [bottomData, setBottomData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || authLoading) return;

        const fetchData = async () => {
            setLoading(true);
            try {

                const res = await request('reports/dashboard-sidebar', 'GET');

                if (res && res.success && res.data) {
                    const { section1, section2, section3 } = res.data;
                    
                    setAgendaData(section1 || []);
                    
                    if (user.role === "student") {
                        setMiddleData(section2?.plan || null);
                        const attended = section3?.weekly_attendance?.attended || 0;
                        const scheduled = section3?.weekly_attendance?.scheduled || 0;
                        
                        setBottomData({
                            present: attended,
                            absent: Math.max(0, scheduled - attended)
                        });
                    } else if (user.role === "teacher") {
                        setMiddleData({ ratio: section2?.attendance_ratio || 0 });
                        setBottomData({
                            topClasses: (section3?.top_classes || []).map(c => ({
                                name: c.name,
                                genre: c.genre,
                                studentCount: c.enrollments
                            }))
                        });
                    } else if (user.role === "admin") {
                        setMiddleData({ revenue: section2?.daily_revenue || 0 });
                        setBottomData({ newStudentsCount: section3?.new_students_this_week || 0 });
                    }
                }
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, request]);

    return { agendaData, middleData, bottomData, loading};
};
