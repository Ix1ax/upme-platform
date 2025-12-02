/**
 * Axios-инстанс с автоматическим обновлением токена.
 * Добавляет Bearer-токен в запросы и перезапрашивает accessToken при 401/403.
 *
 * @module axiosInstance
 * @constant {AxiosInstance} axiosInstance — экземпляр axios с интерсепторами
 */

import axios from 'axios';

/**
 * Базовый инстанс axios
 * @type {import('axios').AxiosInstance}
 */
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

/** @type {boolean} Флаг, выполняется ли сейчас обновление токена */
let isRefreshing = false;

/**
 * Очередь запросов, ожидающих завершения refresh-токена
 * @type {{ resolve: Function, reject: Function }[]}
 */
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void; }[] = [];

/**
 * Обрабатывает очередь запросов после refresh
 * @param {unknown} error — ошибка при обновлении токена (если есть)
 * @param {string|null} token — новый access-токен, если refresh успешен
 */
const processQueue = (error: unknown, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Интерсептор запросов — добавляет Authorization-заголовок, если токен есть
 */
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Интерсептор ответов — обновляет токен при 401/403 и повторяет запрос
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Пропускаем, если это не 401/403 или уже повторный запрос
        if (![401, 403].includes(error.response?.status) || originalRequest._retry)
            return Promise.reject(error);

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // Если токенов нет — выходим
        if (!accessToken || !refreshToken)
            return Promise.reject(error);

        originalRequest._retry = true;

        // Если refresh уже выполняется — ставим запрос в очередь
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            // Обновляем токены
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, { refreshToken });

            const newAccess = response.data.accessToken;
            const newRefresh = response.data.refreshToken;

            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
            processQueue(null, newAccess);

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
