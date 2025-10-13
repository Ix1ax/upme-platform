import axiosInstance from "@/shared/api/axiosInstance";

interface regProps {
    name: string,
    email: string;
    password: string;
    confirmPassword: string;
}

class RegisterService {
    register(data: regProps) {
        return axiosInstance.post("/auth/register", data)
    }
}

export default new RegisterService();