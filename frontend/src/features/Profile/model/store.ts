import {makeAutoObservable} from "mobx";
import ProfileService from "@/features/Profile/api/ProfileService";


export class ProfileStore {

    _profile = {}
    _isLoading = false;
    _isAuthenticated = false;


    constructor() {
        makeAutoObservable(this);
    }

    get profile() { return this._profile }
    get isLoading() { return this._isLoading }
    get isAuthenticated() { return this._isAuthenticated }

    fetchProfile = async () => {

        const res = await ProfileService.getProfile()

        this._profile = res?.data
    }
}