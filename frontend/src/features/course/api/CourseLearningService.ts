// features/course/api/CourseLearningService.ts
//
// Сервис для "обучающей" части курсов (студент):
// - получить курс
// - уроки
// - прогресс
// - тест + отправка ответов
// - запись на курс и список записей

import axiosInstance from "@/shared/api/axiosInstance";

/**
 * DTO курса из Course Service (почти как в MyCourses)
 */
export interface CourseResponse {
    id: string;
    title: string;
    description: string;
    previewUrl: string | null;
    structureUrl: string | null;
    lessonsUrl: string | null;
    published: boolean;
    rating: number;
}

/**
 * DTO урока. content — JsonNode на бэке, поэтому пока any.
 * Когда утвердишь формат (например, { type: "markdown", value: "..." }),
 * можно будет сделать нормальный тип вместо any.
 */
export interface LessonResponse {
    id: string;
    courseId: string;
    title: string;
    content: any;
    orderIndex: number;
}

/**
 * Вариант ответа теста.
 * На бэке это тоже JsonNode, но в описании говорилось:
 *   id, title, multiple, options (key, label, correct)
 * Для прохождения студенту "correct" не нужен, но оставляем optional.
 */
export interface TestOption {
    key: string;
    label: string;
    correct?: boolean;
}

export interface TestQuestion {
    id: string;
    title: string;
    multiple: boolean;
    options: TestOption[];
}

/**
 * DTO теста для СТУДЕНТА (без правильных ответов)
 * GET /api/courses/{courseId}/test
 */
export interface CourseTestContentResponse {
    testId: string;
    courseId: string;
    title: string;
    questions: TestQuestion[]; // в Swagger стоит JsonNode — мы описали предполагаемый формат
    passingScore: number;
}

/**
 * Тело отправки ответа на тест.
 * В Swagger:
 * {
 *   "answers": {
 *     "questionId": ["string", "string"]
 *   }
 * }
 */
export interface TestSubmissionRequest {
    answers: Record<string, string[]>;
}

/**
 * Результат попытки прохождения теста
 * (ответ на POST /test/submit и поле latestTestAttempt в прогрессе).
 */
export interface TestAttemptResponse {
    attemptId: string;
    testId: string;
    courseId: string;
    userId: string;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    scorePercent: number;
    createdAt: string;
}

/**
 * Прогресс по курсу
 * GET /api/courses/{courseId}/progress
 */
export interface CourseProgressResponse {
    courseId: string;
    userId: string;
    status: "ACTIVE" | "COMPLETED" | string; // можно расширить, когда будет список статусов
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
    lastCompletedLessonId: string | null;
    updatedAt: string;
    latestTestAttempt: TestAttemptResponse | null;
    testAvailable: boolean;
}

/**
 * Запись на курс
 * GET /api/enrollments/my
 */
export interface EnrollmentResponse {
    id: string;
    courseId: string;
    userId: string;
    status: "ACTIVE" | "COMPLETED" | string;
    progressPercent: number;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface CourseReviewDTO {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface CourseReviewPayload {
    rating: number;
    comment: string;
}

class CourseLearningService {
    /**
     * Публичное получение курса по id
     * GET /api/courses/{id}
     */
    getCourse(courseId: string) {
        return axiosInstance.get<CourseResponse>(`/courses/${courseId}`);
    }

    /**
     * Уроки курса
     * GET /api/courses/{courseId}/lessons
     */
    getLessons(courseId: string) {
        return axiosInstance.get<LessonResponse[]>(
            `/courses/${courseId}/lessons`,
        );
    }

    /**
     * Записаться на курс
     * POST /api/courses/{courseId}/enroll
     */
    enroll(courseId: string) {
        return axiosInstance.post<EnrollmentResponse>(
            `/courses/${courseId}/enroll`,
        );
    }

    /**
     * Мои записи на курсы
     * GET /api/enrollments/my
     */
    getMyEnrollments() {
        return axiosInstance.get<EnrollmentResponse[]>(`/enrollments/my`);
    }

    getCourseReviews(courseId: string) {
        return axiosInstance.get<CourseReviewDTO[]>(`/courses/${courseId}/reviews`);
    }

    upsertCourseReview(courseId: string, payload: CourseReviewPayload) {
        return axiosInstance.post<CourseReviewDTO>(
            `/courses/${courseId}/reviews`,
            payload,
        );
    }

    /**
     * Прогресс по курсу
     * GET /api/courses/{courseId}/progress
     */
    getProgress(courseId: string) {
        return axiosInstance.get<CourseProgressResponse>(
            `/courses/${courseId}/progress`,
        );
    }

    /**
     * Отметить урок пройденным
     * POST /api/courses/{courseId}/lessons/{lessonId}/complete
     */
    completeLesson(courseId: string, lessonId: string) {
        return axiosInstance.post<void>(
            `/courses/${courseId}/lessons/${lessonId}/complete`,
        );
    }

    /**
     * Получить тест для прохождения
     * GET /api/courses/{courseId}/test
     */
    getTest(courseId: string) {
        return axiosInstance.get<CourseTestContentResponse>(
            `/courses/${courseId}/test`,
        );
    }

    /**
     * Отправить ответы на тест
     * POST /api/courses/{courseId}/test/submit
     */
    submitTest(courseId: string, payload: TestSubmissionRequest) {
        return axiosInstance.post<TestAttemptResponse>(
            `/courses/${courseId}/test/submit`,
            payload,
        );
    }

    /**
     * Последняя попытка теста
     * GET /api/courses/{courseId}/test/attempts/latest
     */
    getLatestAttempt(courseId: string) {
        return axiosInstance.get<TestAttemptResponse>(
            `/courses/${courseId}/test/attempts/latest`,
        );
    }
}

export default new CourseLearningService();
