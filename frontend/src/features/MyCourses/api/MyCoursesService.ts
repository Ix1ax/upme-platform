// Сервис для работы с курсами.
// Здесь собраны ручки из Swagger для создания/редактирования курса,
// управления структурой, уроками, тестами, а также для прохождения курса.

import axiosInstance from "@/shared/api/axiosInstance";

/**
 * DTO одного курса из backend (CourseResponse в Swagger)
 */
export interface CourseDTO {
    id: string;
    title: string;
    description: string;
    previewUrl: string | null;
    structureUrl: string | null;
    lessonsUrl: string | null;
    published: boolean;
    rating: number;
}

export type UploadAssetResponse = {
    url?: string;
    publicUrl?: string;
    [key: string]: unknown;
};

export type WebinarLessonPayload = {
    moduleId?: string;
    title: string;
    orderIndex?: number;
    type: "webinar";
    content: {
        blocks: Array<{
            type: "video";
            url: string;
            duration?: number;
        }>;
    };
};


/**
 * Тело создания/редактирования курса (CourseRequest)
 */
export interface CoursePayload {
    title: string;
    description: string;
}

/**
 * Тело создания/редактирования урока (LessonRequest).
 * content – это произвольный JSON (например, текст, блоки, markdown и т.п.),
 * поэтому тип unknown.
 */
export interface LessonPayload {
    title: string;
    content: unknown;
    orderIndex?: number;
}

/**
 * DTO урока с backend (LessonResponse)
 */
export interface LessonDTO {
    id: string;
    courseId: string;
    title: string;
    content: unknown;
    orderIndex: number;
}

/**
 * Тест для управления (с правильными ответами)
 * CourseTestResponse
 */
export interface CourseTestDTO {
    id: string;
    courseId: string;
    title: string;
    questions: unknown; // массив вопросов – структура определяется на backend
    passingScore: number;
}

/**
 * Тело создания/редактирования теста (CourseTestRequest)
 */
export interface CourseTestPayload {
    title: string;
    questions: unknown;
    passingScore: number;
}

/**
 * Тест для прохождения студентом (без правильных ответов)
 * CourseTestContentResponse
 */
export interface CourseTestContentDTO {
    testId: string;
    courseId: string;
    title: string;
    questions: unknown;
    passingScore: number;
}

/**
 * Тело отправки ответов студента (TestSubmissionRequest)
 */
export interface TestSubmissionPayload {
    // backend ждёт JSON с ответами – структура зависит от реализации тестов
    answers: unknown;
}

/**
 * Результат одной попытки прохождения теста
 * (TestAttemptResponse)
 */
export interface TestAttemptDTO {
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
 * DTO прогресса по курсу (CourseProgressResponse)
 */
export interface CourseProgressDTO {
    courseId: string;
    userId: string;
    status: string; // например: NOT_ENROLLED / IN_PROGRESS / COMPLETED
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
    lastCompletedLessonId: string | null;
    updatedAt: string;
    latestTestAttempt: TestAttemptDTO | null;
    testAvailable: boolean;
}

/**
 * DTO записи пользователя на курс (EnrollmentResponse)
 */
export interface EnrollmentDTO {
    id: string;
    courseId: string;
    userId: string;
    status: string; // например: ACTIVE / COMPLETED / CANCELLED
    progressPercent: number;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface CourseLessonDTO {
    id: string;
    courseId: string;
    title: string;
    description: string;
    orderIndex: number;
    content: unknown;
}

export interface CourseLessonPayload {
    title: string;
    description: string;
    orderIndex: number;
    content: unknown;
}

export interface CreateCoursePayload {
    title: string;
    description: string;
    structure?: string;      // опционально, если уже есть структура
    lessons?: string;        // опционально, если уже есть lessons
    preview?: File | null;   // опционально
    assets?: File[];         // опционально
}

class MyCoursesService {
    // ======================
    // 👨‍🏫 Блок: курсы автора
    // ======================

    /**
     * Получить список «Мои курсы» для текущего автора/админа
     * GET /api/courses/my
     */
    getMyCourses() {
        return axiosInstance.get<CourseDTO[]>("/courses/my");
    }

    /**
     * Получить курс по ID
     * GET /api/courses/{id}
     */
    getCourseById(courseID: string) {
        return axiosInstance.get<CourseDTO>(`/courses/${courseID}`);
    }

    /**
     * Создать курс
     * POST /api/courses (multipart/form-data)
     */
    createCourse(payload: CreateCoursePayload) {
        const formData = new FormData();

        // meta-JSON с базовой инфой о курсе
        const meta = {
            title: payload.title,
            description: payload.description,
        };

        // backend ждёт data как строку с JSON
        formData.append("data", JSON.stringify(meta));

        if (payload.structure) {
            formData.append("structure", payload.structure);
        }

        if (payload.lessons) {
            formData.append("lessons", payload.lessons);
        }

        if (payload.preview) {
            formData.append("preview", payload.preview);
        }

        if (payload.assets && payload.assets.length > 0) {
            payload.assets.forEach((file) => formData.append("assets", file));
        }

        return axiosInstance.post<CourseDTO>("/courses", formData /*, {
      headers: { "Content-Type": "multipart/form-data" }, // можно не указывать, браузер сам проставит
    }*/);
    }

    // PATCH /api/courses/{id} можно оставить JSON как у тебя было:
    updateCourse(courseID: string, payload: CoursePayload) {
        return axiosInstance.patch<CourseDTO>(`/courses/${courseID}`, payload);
    }

    /**
     * Удалить курс
     * DELETE /api/courses/{id}
     */
    deleteCourse(courseID: string) {
        return axiosInstance.delete<void>(`/courses/${courseID}`);
    }

    /**
     * Опубликовать/скрыть курс
     * PATCH /api/courses/{id}/publish
     */
    togglePublish(courseID: string, variant: boolean) {
        return axiosInstance.patch<CourseDTO>(`/courses/${courseID}/publish?published=${variant}`);
    }

    /**
     * Загрузить/обновить структуру курса (structure.json)
     * PUT /api/courses/{id}/structure
     */
    uploadStructure(courseID: string, structureJson: string) {
        let parsed: unknown;

        try {
            parsed = JSON.parse(structureJson || "{}");
        } catch (e) {
            console.error(
                "Некорректный JSON в structureJson. Проверь генерацию структуры.",
                e,
            );
            throw e;
        }

        return axiosInstance.put<void>(`/courses/${courseID}/structure`, parsed);
    }

    /**
     * Загрузить/обновить lessons.json
     * PUT /api/courses/{id}/lessons
     *
     * Тело должно быть вида { lessons: [...] } как в примере, который прислал бек.
     */
    uploadLessons(courseID: string, lessonsJson: string) {
        let parsed: unknown;

        try {
            parsed = JSON.parse(lessonsJson || "{}");
        } catch (e) {
            console.error(
                "Некорректный JSON в lessonsJson. Проверь генерацию уроков.",
                e,
            );
            throw e;
        }

        return axiosInstance.put<void>(`/courses/${courseID}/lessons`, parsed);
    }

    // ======================
    // 📚 Блок: уроки курса (если понадобятся CRUD-ручки)
    // ======================

    getLessons(courseId: string) {
        return axiosInstance.get<LessonDTO[]>(`/courses/${courseId}/lessons`);
    }

    createLesson(courseId: string, payload: LessonPayload) {
        return axiosInstance.post<LessonDTO>(`/courses/${courseId}/lessons`, payload);
    }

    updateLesson(courseId: string, lessonId: string, payload: LessonPayload) {
        return axiosInstance.patch<LessonDTO>(
            `/courses/${courseId}/lessons/${lessonId}`,
            payload,
        );
    }

    deleteLesson(courseId: string, lessonId: string) {
        return axiosInstance.delete<void>(`/courses/${courseId}/lessons/${lessonId}`);
    }

    // ======================
    // 🧪 Блок: итоговый тест по курсу
    // ======================

    getTestForManage(courseId: string) {
        return axiosInstance.get<CourseTestDTO>(`/courses/${courseId}/test/manage`);
    }

    upsertTest(courseId: string, payload: CourseTestPayload) {
        return axiosInstance.post<CourseTestDTO>(`/courses/${courseId}/test`, payload);
    }

    getTestForPassing(courseId: string) {
        return axiosInstance.get<CourseTestContentDTO>(`/courses/${courseId}/test`);
    }

    submitTest(courseId: string, payload: TestSubmissionPayload) {
        return axiosInstance.post<TestAttemptDTO>(
            `/courses/${courseId}/test/submit`,
            payload,
        );
    }

    getLatestTestAttempt(courseId: string) {
        return axiosInstance.get<TestAttemptDTO>(
            `/courses/${courseId}/test/attempts/latest`,
        );
    }

    // ======================
    // 🎓 Блок: обучение студента
    // ======================

    enrollToCourse(courseId: string) {
        return axiosInstance.post<EnrollmentDTO>(`/courses/${courseId}/enroll`);
    }

    getMyEnrollments() {
        return axiosInstance.get<EnrollmentDTO[]>("/enrollments/my");
    }

    getCourseProgress(courseId: string) {
        return axiosInstance.get<CourseProgressDTO>(`/courses/${courseId}/progress`);
    }

    getEnrollmentStatus(courseId: string) {
        return axiosInstance.get<EnrollmentDTO>(`/courses/${courseId}/enrollment`);
    }

    completeLesson(courseId: string, lessonId: string) {
        return axiosInstance.post<void>(
            `/courses/${courseId}/lessons/${lessonId}/complete`,
        );
    }

    getCourseLessons(courseId: string) {
        return axiosInstance.get<CourseLessonDTO[]>(
            `/courses/${courseId}/lessons`
        );
    }

    createCourseLesson(
        courseId: string,
        payload: CourseLessonPayload
    ) {
        return axiosInstance.post<CourseLessonDTO>(
            `/courses/${courseId}/lessons`,
            payload
        );
    }

    updateCourseLesson(
        courseId: string,
        lessonId: string,
        payload: CourseLessonPayload
    ) {
        return axiosInstance.patch<CourseLessonDTO>(
            `/courses/${courseId}/lessons/${lessonId}`,
            payload
        );
    }

    deleteCourseLesson(courseId: string, lessonId: string) {
        return axiosInstance.delete<void>(
            `/courses/${courseId}/lessons/${lessonId}`
        );
    }

    /**
     * Загрузить ассет курса (видео, PDF, картинку и т.п.)
     * POST /api/courses/{id}/assets
     *
     * Возвращает объект с url / publicUrl (зависит от бэка).
     */
    uploadCourseAsset(courseId: string, file: File, path?: string) {
        const formData = new FormData();
        formData.append("file", file);

        // path — необязательный, но Swagger его показывает
        if (path) {
            formData.append("path", path);
        }

        return axiosInstance.post<UploadAssetResponse>(
            `/courses/${courseId}/assets`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    }
    /**
     * Создать вебинар как урок.
     * Внутри просто вызывает createCourseLesson с нужным content.
     */
    createWebinarLesson(courseId: string, payload: WebinarLessonPayload) {
        const lessonPayload: CourseLessonPayload = {
            title: payload.title,
            description: "Вебинар",           // можешь потом сделать отдельным полем в UI
            orderIndex: payload.orderIndex ?? 0,
            content: {
                type: "webinar",
                blocks: payload.content.blocks,
            },
        };

        return this.createCourseLesson(courseId, lessonPayload);
    }

    /**
     * (опционально) обновление вебинара
     */
    updateWebinarLesson(
        courseId: string,
        lessonId: string,
        payload: WebinarLessonPayload,
    ) {
        const lessonPayload: CourseLessonPayload = {
            title: payload.title,
            description: "Вебинар",
            orderIndex: payload.orderIndex ?? 0,
            content: {
                type: "webinar",
                blocks: payload.content.blocks,
            },
        };

        return this.updateCourseLesson(courseId, lessonId, lessonPayload);
    }
}




export default new MyCoursesService();
