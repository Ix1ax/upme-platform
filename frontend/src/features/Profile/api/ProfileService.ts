// src/features/Profile/api/ProfileService.ts
//
// Сервис для работы с профилем через UPME Profile Service API.
// Здесь три основных метода:
// - getProfile  -> GET  /api/profile/me
// - updateProfile -> POST /api/profile      (JSON: displayName, bio, city, phone)
// - updateAvatar  -> POST /api/profile/avatar (multipart/form-data с файлом avatar)

import axiosInstance from "@/shared/api/axiosInstance";

/**
 * Ответ профиля с бэка.
 * Совпадает со схемой ProfileResponse из Swagger:
 * {
 *   id: string;
 *   displayName: string;
 *   bio: string;
 *   avatarUrl: string;
 *   city: string;
 *   phone: string;
 *   role: string;
 * }
 */
export interface ProfileResponse {
    id: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    city: string;
    phone: string;
    role: string;
}

/**
 * Тело запроса на обновление профиля (без аватара).
 * Это ProfileUpdateWithoutAvatarRequest из Swagger:
 * {
 *   displayName: string;
 *   bio: string;
 *   city: string;
 *   phone: string;
 * }
 *
 * Все поля опциональны — отсутствующие НЕ затирают старые значения.
 */
export interface ProfileUpdatePayload {
    displayName?: string | undefined;
    bio?: string | undefined;
    city?: string | undefined;
    phone?: string | undefined;
}

class ProfileService {
    /**
     * Получить мой профиль.
     * GET /api/profile/me
     */
    getProfile() {
        return axiosInstance.get<ProfileResponse>("/profile/me");
    }

    /**
     * Обновить профиль (без аватара).
     * POST /api/profile
     * Принимает JSON, возвращает обновлённый профиль.
     */
    updateProfile(payload: ProfileUpdatePayload) {
        return axiosInstance.post<ProfileResponse>("/profile", payload);
    }

    /**
     * Обновить аватар.
     * POST /api/profile/avatar
     * Отправляем multipart/form-data с полем "avatar".
     * В ответ получаем обновлённый профиль.
     */
    updateAvatar(file: File) {
        const formData = new FormData();
        formData.append("avatar", file);

        return axiosInstance.post<ProfileResponse>("/profile/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}

export default new ProfileService();
