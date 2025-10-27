import axiosInstance from "@/shared/api/axiosInstance";

export default class AuthService {

    static async getProfile () {
        return axiosInstance.get('/profile/me')
    }
    static async logout () {
        const refreshToken = localStorage.getItem('refreshToken');
        return axiosInstance.post('auth/logout', {refreshToken})
    }
}