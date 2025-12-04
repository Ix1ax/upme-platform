import { useEffect, useState } from "react";
import {
    Button,
    Container,
    FileButton,
    Group,
    Image,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";

import CourseForm, {
    type CourseFormValues,
} from "@/widgets/MyCourses/CourseForm";
import MyCoursesService, {
    type CourseDTO,
    type CoursePayload,
} from "@/features/MyCourses/api/MyCoursesService";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";
import MainLayout from "@/layouts/main/MainLayout";
import CourseLessonsEditor from "@/features/MyCourses/ui/CourseLessonsEditor";
import CourseTestEditor from "@/features/MyCourses/ui/CourseTestEditor";

export default function EditCoursePage() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initial, setInitial] = useState<CourseFormValues | null>(null);
    const [course, setCourse] = useState<CourseDTO | null>(null);


    useEffect(() => {
        (async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await MyCoursesService.getCourseById(id);
                const loaded: CourseDTO = data;

                setCourse(loaded);
                setInitial({
                    title: loaded.title,
                    description: loaded.description,
                });
            } catch (e) {
                console.error("Ошибка загрузки курса:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);


    const handleSubmit = async (values: CourseFormValues) => {
        if (!id) return;

        const payload: CoursePayload = {
            title: values.title.trim(),
            description: values.description.trim(),
        };

        try {
            setSaving(true);
            const { data: updated } = await MyCoursesService.updateCourse(
                id,
                payload,
            );
            setCourse(updated);
            // при желании можно показать уведомление/тост
        } catch (e) {
            console.error("Ошибка обновления курса:", e);
        } finally {
            setSaving(false);
        }
    };

    const handlePreviewUpload = async (file: File | null) => {
        if (!file || !id) return;

        try {
            const updated = await MyCoursesService.setCoursePreview(id, file);
            setCourse(updated); // чтобы картинка сразу обновилась в UI
        } catch (e) {
            console.error("Ошибка загрузки превью курса:", e);
        }
    };




    if (!id) {
        return (
            <MainLayout>
                <Container>
                    <Text c="red">Не указан идентификатор курса.</Text>
                </Container>
            </MainLayout>
        );
    }

    const FALLBACK_IMG = "/img/plug.avif";

    return (
        <MainLayout>
            <Container>
                <Title order={2} mb="md">
                    Редактировать курс
                </Title>

                <Stack gap="lg">
                    <CourseForm
                        initial={initial ?? undefined}
                        loading={loading || saving}
                        submitLabel="Сохранить изменения"
                        onSubmit={handleSubmit}
                    />

                    {/* Обложка курса */}
                    {course && (
                        <Stack gap="xs">
                            <Text fw={500}>Обложка курса</Text>
                            <Group align="flex-start" gap="md">
                                <Image
                                    src={course.previewUrl || "/img/plug.avif"}
                                    fallbackSrc="/img/plug.avif"
                                    alt={course.title}
                                    w={220}
                                    radius="md"
                                />
                                <FileButton onChange={handlePreviewUpload} accept="image/*">
                                    {(props) => (
                                        <Button {...props} variant="light">
                                            Загрузить изображение
                                        </Button>
                                    )}
                                </FileButton>
                            </Group>
                        </Stack>
                    )}


                    {/* CRUD уроков курса */}
                    <CourseLessonsEditor courseId={id} />

                    {/* CRUD итогового теста по курсу */}
                    <CourseTestEditor courseId={id} />

                    <Text
                        size="sm"
                        c="dimmed"
                        mt="sm"
                        onClick={() => nav(STATIC_LINKS.MY_COURSES)}
                        style={{ cursor: "pointer" }}
                    >
                        ← Вернуться к списку моих курсов
                    </Text>
                </Stack>
            </Container>
        </MainLayout>
    );

}
