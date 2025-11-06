import axiosInstance from "@/shared/api/axiosInstance";

class CourseService {

    getCourse(id: string) {
        return axiosInstance.get(`/courses/${id}`);
    }

}

export default new CourseService();