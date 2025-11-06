import CourseService from "@/features/course/api/CourseService";
import {makeAutoObservable} from "mobx";


class CourseStore {

    _course : {
        id: string;
        title: string;
        description: string;
        previewUrl: string;
        structureUrl: string;
        published: boolean;
        rating: number;
    } | undefined
    _isLoading = false;

    get course () {return this._course}
    get isLoading () {return this._isLoading}

    constructor() {
        makeAutoObservable(this)
    }

    getCourse = async (id: string) => {
        this._isLoading = true;
        try {
            const res = await CourseService.getCourse(id);
            this._course = res?.data;
        } catch (error) {
            console.error(error);
        }finally {
            this._isLoading = false;
        }
    }



}

export default new CourseStore();