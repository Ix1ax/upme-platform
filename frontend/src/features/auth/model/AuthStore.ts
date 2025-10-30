import LoginService from "@/features/auth/login/api/loginService";
import RegisterService from "@/features/auth/register/api/registerService";
import AuthService from "@/features/auth/api/authService";
import { makeAutoObservable } from "mobx";

interface regProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface userState {
    id: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    city: string;
    phone: string;
    role: string;
}

export class AuthStore {
    constructor() {
        makeAutoObservable(this);
    }

    _isAuthenticated: boolean = false;
    _user: userState | null = null;
    _isLoading: boolean = false;
    _isLoadingProfile: boolean = false;
    _profileLoaded: boolean = false; // ⚡ добавляем флаг чтобы не дёргать profile повторно

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    get user() {
        return this._user;
    }

    get isLoading() {
        return this._isLoading;
    }

    get isLoadingProfile() {
        return this._isLoadingProfile;
    }

    /** 🔐 Логин */
    login = async (acc: { email: string; password: string }) => {
        this._isLoading = true;
        try {
            const res = await LoginService.login(acc);
            const data = res?.data;
            const accessToken = data?.accessToken;
            const refreshToken = data?.refreshToken;

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                await this.profile(); // подгружаем профиль сразу после логина
                this._isAuthenticated = true;
                return !!this.user;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            this._isLoading = false;
        }
    };

    /** 📝 Регистрация */
    register = async (acc: regProps) => {
        this._isLoading = true;
        try {
            const res = await RegisterService.register(acc);
            const data = res?.data;
            const accessToken = data?.accessToken;
            const refreshToken = data?.refreshToken;

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                this._isAuthenticated = true;
                await this.profile(); // после регистрации тоже сразу подгружаем профиль
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            this._isLoading = false;
        }
    };

    /** 👤 Получить профиль (только один раз) */
    profile = async () => {
        if (this._profileLoaded) return true; // ⚡ если уже загружали, не повторяем

        this._isLoadingProfile = true;
        try {
            const res = await AuthService.getProfile();
            this._user = res?.data;
            this._isAuthenticated = true;
            this._profileLoaded = true; // флаг что уже загружали
            return true;
        } catch (e) {
            this._isAuthenticated = false;
            this._user = null;
            console.error("Ошибка получения данных пользователя", e);
            return false;
        } finally {
            this._isLoadingProfile = false;
        }
    };

    /** 🚪 Выход */
    logout = async () => {
        this._isLoading = true;
        try {
            await AuthService.logout();
        } catch (error) {
            console.error(error);
        } finally {
            this._user = null;
            this._isAuthenticated = false;
            this._profileLoaded = false; // сбрасываем, чтобы при следующем входе можно было снова загрузить
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            this._isLoading = false;
        }
    };
}
