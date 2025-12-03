
// MobX-store для кабинета автора: список его курсов.
// Берёт данные из MyCoursesService и превращает их в удобный вид для UI.

import { makeAutoObservable } from "mobx";
import MyCoursesService, {
    type CourseDTO,
} from "@/features/MyCourses/api/MyCoursesService";

/**
 * Локальный тип для карточки курса в UI.
 * Можно хранить только то, что реально нужно в интерфейсе.
 */
interface MyCourseCard {
    id: string;
    title: string;
    description: string;
    previewUrl: string | null;
    structureUrl: string | null;
    published: boolean;
    rating: number;
}

class MyCoursesStore {
    /** Список курсов автора */
    _courses: MyCourseCard[] = [];
    /** Флаг загрузки списка */
    _isLoading = false;

    constructor() {
        // autoBind: true — чтобы методы можно было передавать без .bind(this)
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get courses() {
        return this._courses;
    }

    get isLoading() {
        return this._isLoading;
    }

    /**
     * Загрузить список «Мои курсы» с backend
     * GET /api/courses/my
     */
    async getCourses(): Promise<void> {
        this._isLoading = true;

        try {
            const res = await MyCoursesService.getMyCourses();

            // Если backend по какой-то причине вернул undefined/null – подстраховываемся
            const data: CourseDTO[] = res?.data ?? [];

            this._courses = data.map(
                (dto): MyCourseCard => ({
                    id: dto.id,
                    title: dto.title,
                    description: dto.description,
                    previewUrl: dto.previewUrl ?? null,
                    structureUrl: dto.structureUrl ?? null,
                    published: dto.published ?? false,
                    rating: dto.rating ?? 0,
                }),
            );
        } catch (error) {
            console.error("Ошибка загрузки курсов:", error);
            this._courses = [];
        } finally {
            this._isLoading = false;
        }
    }
}

export default new MyCoursesStore();
