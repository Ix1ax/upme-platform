import {createBrowserRouter} from "react-router-dom";
import App from "@/app/App";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import HomePage from "@/pages/home/HomePage";
import LoginPage from "@/pages/login/LoginPage";
import RegistrationPage from "@/pages/registration/RegistrationPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";

export const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            { index: true, element: <HomePage /> },
            { path: STATIC_LINKS.LOGIN, element: <LoginPage /> },
            { path: STATIC_LINKS.REGISTER, element: <RegistrationPage /> }
        ]
    },
    { path: '*', element: <NotFoundPage /> }
])