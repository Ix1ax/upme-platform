import axiosInstance from "@/shared/api/axiosInstance";

interface loginProps {
    email: string;
    password: string;
}

class CatalogService {
    login(data: loginProps) {
        return axiosInstance.post("/auth/login", data)
    }
}

export default new CatalogService();