import axiosInstance from "@/shared/api/axiosInstance";

class ProfileService {

    getProfile() {
        return axiosInstance.get("/profile/me");
    }
}

export default new ProfileService();