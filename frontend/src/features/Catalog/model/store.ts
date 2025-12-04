// src/features/Catalog/model/CatalogStore.ts
import CatalogService, {
    type CoursesQueryParams,
} from "@/features/Catalog/api/CatalogService";
import { makeAutoObservable } from "mobx";

export type AuthorDTO = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export class CatalogStore {
    constructor() {
        makeAutoObservable(this);
    }

    _courses: any[] = [];
    _isLoading = false;

    _authors: AuthorDTO[] = [];
    _isAuthorsLoading = false;

    get courses() { return this._courses; }
    get isLoading() { return this._isLoading; }

    get authors() { return this._authors; }
    get isAuthorsLoading() { return this._isAuthorsLoading; }

    // 🔥 теперь getCourses умеет принимать фильтры
    getCourses = async (filters?: CoursesQueryParams) => {
        this._isLoading = true;
        try {
            const res = await CatalogService.getCourses(filters);
            console.log("Courses response:", res?.data);
            this._courses = Array.isArray(res?.data)
                ? res.data
                : res?.data?.content ?? [];
        } catch (error) {
            console.error("Ошибка при получении курсов:", error);
            this._courses = [];
        } finally {
            this._isLoading = false;
        }
    };

    loadAuthors = async () => {
        this._isAuthorsLoading = true;
        try {
            const res = await CatalogService.getAuthors();
            console.log("Authors response:", res?.data);
            this._authors = Array.isArray(res?.data) ? res.data : [];
        } catch (error) {
            console.error("Ошибка при получении авторов:", error);
            this._authors = [];
        } finally {
            this._isAuthorsLoading = false;
        }
    };
}
