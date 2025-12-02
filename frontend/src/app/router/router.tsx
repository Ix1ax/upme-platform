import {createBrowserRouter} from "react-router-dom";
import App from "@/app/App";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import HomePage from "@/pages/home/HomePage";
import LoginPage from "@/pages/login/LoginPage";
import RegistrationPage from "@/pages/registration/RegistrationPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import CatalogPage from "@/pages/Catalog/CatalogPage";
import CoursePage from "@/pages/Course/CoursePage";
import MyCoursesPage from "@/pages/MyCourses/MyCoursesPage";
import PrivateRoute from "@/app/router/PrivateRoute";
import MyCoursesLayout from "@/pages/MyCourses/Layout";
import CreateCoursePage from "@/pages/MyCourses/CreateCoursePage";
import EditCoursePage from "@/pages/MyCourses/EditCoursePage";
import MyLearningPage from "@/pages/MyLearning/MyLearningPage";

export const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            { index: true, element: <HomePage /> },
            { path: STATIC_LINKS.LOGIN, element: <LoginPage /> },
            { path: STATIC_LINKS.REGISTER, element: <RegistrationPage /> },
            { path: STATIC_LINKS.CATALOG, element: <CatalogPage /> },
            { path: STATIC_LINKS.PROFILE, element: <ProfilePage />},
            { path: STATIC_LINKS.COURSE, element: <CoursePage /> },
            {
                element: <PrivateRoute />,
                children: [
                    {
                        path: STATIC_LINKS.MY_COURSES,
                        element: <MyCoursesLayout />,
                        children: [
                            { index: true, element: <MyCoursesPage /> },
                            { path: "new", element: <CreateCoursePage /> },
                            { path: ":id/edit", element: <EditCoursePage /> },
                        ],
                    },
                    // 🆕 страница "Моё обучение"
                    {
                        path: STATIC_LINKS.MY_LEARNING,
                        element: <MyLearningPage />,
                    },
                ],
            },

        ]
    },
    { path: '*', element: <NotFoundPage /> }
])