import {observer} from "mobx-react-lite";
import LoginWidget from "@/widgets/login/LoginWidget";

const LoginPage = observer(() => {
    return (
        <LoginWidget />
    )
})

export default LoginPage;