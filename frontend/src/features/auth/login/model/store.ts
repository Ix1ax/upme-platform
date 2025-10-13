import {makeAutoObservable} from "mobx";
import LoginService from "../api/loginService";

export class AuthStore {

    _isLoading = false;
    _isAuth = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isAuth() { return this._isAuth; }
    get isLoading() {
        return this._isLoading;
    }

    login = async (acc : {email: string, password: string}) => {
        this._isLoading = true;
        try {
            const res = await LoginService.login(acc)
            const data = res?.data;
            const accessToken = data?.accessToken;
            const refreshToken = data.refreshToken;
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                this._isAuth = true;
                return true;
            }
            return false;
        } catch(error) {
            console.error(error)
            return false;
        } finally {
            this._isLoading = false;
        }
    }

}