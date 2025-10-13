import {makeAutoObservable} from "mobx";
import RegisterService from "../api/registerService";

interface regProps {
    name: string,
    email: string;
    password: string;
    confirmPassword: string;
}

export class registerStore {

    _isLoading = false;
    _isAuth = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoading() {
        return this._isLoading;
    }

    register = async (acc : regProps) => {
        this._isLoading = true;
        try {
            const res = await RegisterService.register(acc)
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