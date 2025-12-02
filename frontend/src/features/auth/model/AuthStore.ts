import LoginService from "@/features/auth/login/api/loginService";
import RegisterService from "@/features/auth/register/api/registerService";
import AuthService from "@/features/auth/api/authService";
import ProfileService, {
    type ProfileResponse,
} from "@/features/Profile/api/ProfileService";
import { makeAutoObservable } from "mobx";

interface regProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Состояние пользователя в сторе.
 * По сути это то же самое, что ProfileResponse на бэке.
 */
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

    // ===== Приватные поля стора =====

    _isAuthenticated: boolean = false; // залогинен ли пользователь
    _user: userState | null = null;    // данные профиля
    _isLoading: boolean = false;       // общий флаг загрузки (логин/регистрация/логаут)
    _isLoadingProfile: boolean = false; // отдельный флаг для загрузки профиля
    _profileLoaded: boolean = false;   // уже пробовали загрузить профиль или нет

    // ===== Геттеры =====

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

    get profileLoaded() {
        return this._profileLoaded;
    }

    /**
     * Утилита: проставить пользователя в стор из ответа профиля.
     * Используется и при GET /profile/me, и после обновления профиля/аватара.
     */
    setUserFromProfile = (profile: ProfileResponse) => {
        this._user = profile;
        this._isAuthenticated = true;
        this._profileLoaded = true;
    };

    /**
     * Проверить, авторизован ли пользователь.
     * - Если нет accessToken в localStorage → точно не авторизован.
     * - Если токен есть и профиль ещё не грузили → грузим профиль.
     */
    ensureAuth = async () => {
        const hasToken = !!localStorage.getItem("accessToken");
        if (!hasToken) {
            this._isAuthenticated = false;
            return false;
        }

        if (!this._profileLoaded && !this._isLoadingProfile) {
            await this.profile();
        }
        return this._isAuthenticated;
    };

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

                // После логина сразу тянем профиль через ProfileService
                await this.profile();
                return !!this.user;
            }
            return false;
        } catch (error) {
            console.error(error);
            this._isAuthenticated = false;
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

                // После регистрации тоже сразу подгружаем профиль.
                // На бэке по логике создаётся пустой профиль, который
                // пользователь потом дозаполняет в личном кабинете.
                await this.profile();
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            this._isAuthenticated = false;
            return false;
        } finally {
            this._isLoading = false;
        }
    };

    /** 👤 Получить профиль пользователя (один раз за сессию) */
    profile = async () => {
        // Если уже грузили профиль ранее — повторно не идём на бэк
        if (this._profileLoaded) return true;

        this._isLoadingProfile = true;
        try {
            // Используем UPME Profile Service:
            // GET /api/profile/me
            const res = await ProfileService.getProfile();

            this.setUserFromProfile(res.data);
            return true;
        } catch (e) {
            // Если запрос упал (например, 401), считаем, что пользователь не авторизован
            this._isAuthenticated = false;
            this._user = null;
            console.error("Ошибка получения данных пользователя", e);
            this._profileLoaded = true; // чтобы не крутить бесконечную загрузку
            return false;
        } finally {
            this._isLoadingProfile = false;
        }
    };

    /** 🚪 Выход */
    logout = async () => {
        this._isLoading = true;
        try {
            // Здесь остаётся твой AuthService.logout(), если он что-то делает на бэке
            await AuthService.logout();
        } catch (error) {
            console.error(error);
        } finally {
            this._user = null;
            this._isAuthenticated = false;
            this._profileLoaded = false;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            this._isLoading = false;
        }
    };
}
