import { makeAutoObservable } from 'mobx';
import {AuthStore} from "@/features/auth/model/AuthStore";
import {CatalogStore} from "@/features/Catalog/model/store";


export class Store {
    auth: AuthStore;
    catalog: CatalogStore

    constructor() {
        this.auth = new AuthStore();
        this.catalog = new CatalogStore();

        makeAutoObservable(this);
    }
}

