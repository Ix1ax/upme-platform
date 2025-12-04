import { useState } from "react";
import { Container, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import CourseForm, {
    type CourseFormValues,
} from "@/widgets/MyCourses/CourseForm";
import MyCoursesService, {
} from "@/features/MyCourses/api/MyCoursesService";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";
import MainLayout from "@/layouts/main/MainLayout";

export default function CreateCoursePage() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: CourseFormValues) => {
        try {
            setLoading(true);

            const { data: course } = await MyCoursesService.createCourse({
                title: values.title.trim(),
                description: values.description.trim(),
                // пока без preview / structure / lessons
            });

            nav(STATIC_LINKS.MY_COURSES_EDIT(course.id));
        } catch (e) {
            console.error("Ошибка создания курса:", e);
        } finally {
            setLoading(false);
        }
    };


    return (
        <MainLayout>
            <Container>
                <Title order={2} mb="md">
                    Создать курс
                </Title>

                <CourseForm
                    submitLabel="Создать курс"
                    loading={loading}
                    onSubmit={handleSubmit}
                />
            </Container>
        </MainLayout>
    );
}
