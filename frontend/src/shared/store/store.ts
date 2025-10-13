import { makeAutoObservable } from 'mobx';
import {AuthStore} from "@/features/auth/login/model/store";
import {registerStore} from "@/features/auth/register/model/store";

export class Store {
    auth: AuthStore;
    reg: registerStore;

    constructor() {
        this.auth = new AuthStore();
        this.reg = new registerStore();

        makeAutoObservable(this);
    }
}

