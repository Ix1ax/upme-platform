import AuthLayout from "@/layouts/auth/AuthLayout";
import Login from "@/features/auth/login/ui/Login"

const LoginWidget = () => {
    return (
        <AuthLayout>
            <Login />
        </AuthLayout>
    )
}

export default LoginWidget;