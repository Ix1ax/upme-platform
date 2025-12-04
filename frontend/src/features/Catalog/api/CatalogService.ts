// src/features/Catalog/api/CatalogService.ts
import axiosInstance from "@/shared/api/axiosInstance";

export type CoursesQueryParams = {
    query?: string;
    authorId?: string | null;
    minRating?: number | null;
    sort?: "rating_desc" | "rating_asc" | "newest" | "oldest";
};

class CatalogService {

    // 🔥 теперь с фильтрами, которые понимает бэк
    getCourses(params?: CoursesQueryParams) {
        return axiosInstance.get("/courses", {
            params: {
                query: params?.query || undefined,
                authorId: params?.authorId || undefined,
                minRating: params?.minRating ?? undefined,
                sort: params?.sort || undefined,
            },
        });
    }

    getAuthors() {
        return axiosInstance.get("/auth/authors");
    }
}

export default new CatalogService();
