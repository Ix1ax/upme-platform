import {observer} from "mobx-react-lite";
import Register from "@/features/auth/register/ui/Register";
import AuthLayout from "@/layouts/auth/AuthLayout";

const RegistrationWidget = observer(() => {
    return (
        <AuthLayout>
            <Register />
        </AuthLayout>
    )
})

export default RegistrationWidget;