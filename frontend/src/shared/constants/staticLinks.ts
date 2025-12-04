export const STATIC_LINKS = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',

    CATALOG: '/catalog',
    PROFILE: '/profile',

    COURSE: '/course/:id',
    COURSE_BY_ID: (id: string) => `/course/${id}`,

    MY_COURSES: '/my-courses',
    MY_COURSES_NEW: '/my-courses/new',
    MY_COURSES_EDIT: (id: string) => `/my-courses/${id}/edit`,

    MY_LEARNING: '/learning',
};
