import axiosInstance from "@/shared/api/axiosInstance";

class CatalogService {

    getCourses () {
        return axiosInstance.get("/courses");
    }


}

export default new CatalogService();