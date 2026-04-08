/**
 * Servicio especializado para la lógica de negocio de Estudiantes en Cadencia.
 */
export const studentService = (request) => ({
    // Obtener todo el perfil del estudiante (Historial completo)
    getFullHistory: async (studentId) => {
        const [student, plan, attendances, payments] = await Promise.all([
            request(`students/${studentId}`),
            request(`plans/student/${studentId}`),
            request(`attendances?student_id=${studentId}`),
            request(`payments?user_id=${studentId}`)
        ]);

        return {
            student: student.data,
            activePlan: plan.data,
            attendances: attendances.data || [],
            payments: payments.data || []
        };
    },

    // Pausar un plan (Lógica específica que mencionaste en tu código)
    pausePlan: async (planId, reason) => {
        return await request(`plans/${planId}`, "PUT", {
            status: 'paused',
            notes: reason
        });
    }
});