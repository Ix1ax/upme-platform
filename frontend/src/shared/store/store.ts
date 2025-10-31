import { makeAutoObservable } from 'mobx';
import {AuthStore} from "@/features/auth/model/AuthStore";


export class Store {
    auth: AuthStore;

    constructor() {
        this.auth = new AuthStore();

        makeAutoObservable(this);
    }
}

