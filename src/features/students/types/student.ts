export const StudentType = {
    id: 'number',
    first_name: 'string',
    last_name: 'string',
    email: 'string',
    role_name: 'string',
    gender: 'string',
    created_at: 'date'
};


export const StudentHistoryTypes = {
    Attendance: {
        id: 'number',
        date: 'string (ISO)',
        class_name: 'string',
        status: 'present | absent'
    },
    Payment: {
        id: 'number',
        payment_date: 'string',
        amount: 'number',
        status: 'completed | pending',
        payment_method: 'string'
    },
    Plan: {
        id: 'number',
        name: 'string',
        status: 'active | paused | inactive',
        classes_remaining: 'number',
        max_classes: 'number'
    }
};