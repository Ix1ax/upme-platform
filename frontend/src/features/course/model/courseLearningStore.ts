// Стор, который отвечает именно за "обучение" на ОДНОМ курсе:
// - держит курс, уроки, прогресс, тест
// - умеет: записаться, отметить урок пройденным, загрузить/отправить тест

import { makeAutoObservable, runInAction } from "mobx";
import CourseLearningService, {
    type CourseResponse,
    type LessonResponse,
    type CourseProgressResponse,
    type CourseTestContentResponse,
    type TestAttemptResponse,
    type TestSubmissionRequest,
} from "@/features/course/api/CourseLearningService";

class CourseLearningStore {
    // --- состояние ---

    course: CourseResponse | null = null;
    lessons: LessonResponse[] = [];
    progress: CourseProgressResponse | null = null;
    test: CourseTestContentResponse | null = null;
    latestAttempt: TestAttemptResponse | null = null;

    // id текущего выбранного урока (для отображения справа)
    currentLessonId: string | null = null;

    // флаги загрузки
    isLoadingCourse = false;
    isLoadingLessons = false;
    isLoadingProgress = false;
    isLoadingTest = false;
    isSubmittingTest = false;
    isEnrolling = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // --- computed-поля ---

    get isEnrolled(): boolean {
        // если прогресс есть — значит пользователь уже записан
        return !!this.progress;
    }

    get currentLesson(): LessonResponse | null {
        if (!this.currentLessonId) return null;
        return this.lessons.find((l) => l.id === this.currentLessonId) ?? null;
    }

    get completedLessonIds(): Set<string> {
        // из прогресса мы знаем только количество завершённых,
        // но не список. Если бэк когда-нибудь будет отдавать список id,
        // сюда можно добавить реальную логику.
        return new Set<string>();
    }

    // --- загрузка курса/уроков/прогресса "одним махом" ---

    async init(courseId: string) {
        // параллельно загружаем курс, уроки и прогресс
        this.isLoadingCourse = true;
        this.isLoadingLessons = true;
        this.isLoadingProgress = true;

        try {
            const [courseRes, lessonsRes, progressRes] = await Promise.allSettled([
                CourseLearningService.getCourse(courseId),
                CourseLearningService.getLessons(courseId),
                CourseLearningService.getProgress(courseId),
            ]);

            runInAction(() => {
                if (courseRes.status === "fulfilled") {
                    this.course = courseRes.value.data;
                }

                if (lessonsRes.status === "fulfilled") {
                    // сортируем по orderIndex на всякий случай
                    this.lessons = [...lessonsRes.value.data].sort(
                        (a, b) => a.orderIndex - b.orderIndex,
                    );
                    // если ещё нет выбранного урока — ставим первый
                    if (!this.currentLessonId && this.lessons.length > 0) {
                        this.currentLessonId = this.lessons[0].id;
                    }
                }

                if (progressRes.status === "fulfilled") {
                    this.progress = progressRes.value.data;
                    this.latestAttempt = progressRes.value.data.latestTestAttempt;
                }
            });
        } catch (e) {
            console.error("Ошибка инициализации курса", e);
        } finally {
            runInAction(() => {
                this.isLoadingCourse = false;
                this.isLoadingLessons = false;
                this.isLoadingProgress = false;
            });
        }
    }

    // --- запись на курс ---

    async enroll(courseId: string) {
        this.isEnrolling = true;
        try {
            await CourseLearningService.enroll(courseId);
            // после успешной записи сразу подтягиваем прогресс
            const res = await CourseLearningService.getProgress(courseId);
            runInAction(() => {
                this.progress = res.data;
                this.latestAttempt = res.data.latestTestAttempt;
            });
        } catch (e) {
            console.error("Ошибка записи на курс", e);
        } finally {
            runInAction(() => {
                this.isEnrolling = false;
                this.isLoadingProgress = false;
            });
        }
    }

    // --- выбор урока ---

    setCurrentLesson(lessonId: string) {
        this.currentLessonId = lessonId;
    }

    // --- отметить урок пройденным ---

    async completeLesson(courseId: string, lessonId: string) {
        try {
            await CourseLearningService.completeLesson(courseId, lessonId);
            // обновляем прогресс
            const res = await CourseLearningService.getProgress(courseId);
            runInAction(() => {
                this.progress = res.data;
                this.latestAttempt = res.data.latestTestAttempt;
            });
        } catch (e) {
            console.error("Ошибка отметки урока пройденным", e);
        }
    }

    // --- тест ---

    async loadTest(courseId: string) {
        this.isLoadingTest = true;
        try {
            const res = await CourseLearningService.getTest(courseId);
            runInAction(() => {
                this.test = res.data;
            });
        } catch (e) {
            console.error("Ошибка загрузки теста", e);
        } finally {
            runInAction(() => {
                this.isLoadingTest = false;
            });
        }
    }

    async submitTest(courseId: string, payload: TestSubmissionRequest) {
        this.isSubmittingTest = true;
        try {
            const res = await CourseLearningService.submitTest(courseId, payload);
            runInAction(() => {
                this.latestAttempt = res.data;
                // тест считается пройденным — обновляем прогресс
            });
            const prog = await CourseLearningService.getProgress(courseId);
            runInAction(() => {
                this.progress = prog.data;
            });
        } catch (e) {
            console.error("Ошибка отправки теста", e);
        } finally {
            runInAction(() => {
                this.isSubmittingTest = false;
            });
        }
    }

    // --- сброс стора (например, при выходе с страницы курса) ---

    reset() {
        this.course = null;
        this.lessons = [];
        this.progress = null;
        this.test = null;
        this.latestAttempt = null;
        this.currentLessonId = null;

        this.isLoadingCourse = false;
        this.isLoadingLessons = false;
        this.isLoadingProgress = false;
        this.isLoadingTest = false;
        this.isSubmittingTest = false;
        this.isEnrolling = false;
    }
}

// Экземпляр на весь фронт. Если захочешь — можно сделать фабрику и
// хранить стор в React Context для каждой страницы.
const courseLearningStore = new CourseLearningStore();
export default courseLearningStore;
