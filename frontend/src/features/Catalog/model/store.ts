import CatalogService from "@/features/Catalog/api/CatalogService";
import {makeAutoObservable} from "mobx";


export class CatalogStore {

    constructor() {
        makeAutoObservable(this)
    }

    _courses = [
        // {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },
        // {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },
        // {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },
        // {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },        {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },
        // {
        //     id: "asdas-asdasd-asqqq",
        //     title: "dadasd",
        //     description: "dadasd",
        //     previewUrl: "",
        //     structureUrl: "",
        //     published: true,
        //     rating: 0
        // },
    ];
    _isLoading = false;

    get courses () {return this._courses;}
    get isLoading () {return this._isLoading;}



    getCourses = async () => {
        this._isLoading = true;
        try {
            const res = await CatalogService.getCourses();
            console.log("Courses response:", res?.data);
            this._courses = Array.isArray(res?.data) ? res.data : res?.data?.content ?? [];
        } catch (error) {
            console.error("Ошибка при получении курсов:", error);
            this._courses = [];
        } finally {
            this._isLoading = false;
        }
    }
}