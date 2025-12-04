import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Card,
    Group,
    Loader,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Button,
} from "@mantine/core";
import CourseLearningService, {
    type CourseResponse,
    type EnrollmentResponse,
} from "@/features/course/api/CourseLearningService";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";

type LearningCard = {
    enrollment: EnrollmentResponse;
    course: CourseResponse | null;
};

export default function MyLearningSection() {
    const [items, setItems] = useState<LearningCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const nav = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Получаем все записи пользователя на курсы
                const enrollRes = await CourseLearningService.getMyEnrollments();
                const enrollments = enrollRes.data;

                if (enrollments.length === 0) {
                    setItems([]);
                    return;
                }

                // 2. Для каждой записи подтягиваем данные курса
                const coursePromises = enrollments.map((e) =>
                    CourseLearningService
                        .getCourse(e.courseId)
                        .then((res) => res.data)
                        .catch(() => null), // если курс не загрузился — покажем без него
                );

                const courses = await Promise.all(coursePromises);

                const merged: LearningCard[] = enrollments.map((e, idx) => ({
                    enrollment: e,
                    course: courses[idx],
                }));

                setItems(merged);
            } catch (e) {
                console.error("Ошибка загрузки моих курсов", e);
                setError("Не удалось загрузить ваши курсы.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <Stack align="center" mt="xl">
                <Loader />
                <Text c="dimmed">Загружаем ваши курсы...</Text>
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack align="center" mt="xl">
                <Text c="red">{error}</Text>
            </Stack>
        );
    }

    if (items.length === 0) {
        return (
            <Stack align="center" mt="xl">
                <Title order={3}>Вы ещё не записаны ни на один курс</Title>
                <Text c="dimmed">
                    Загляните в каталог и выберите первый курс для обучения.
                </Text>
                <Button onClick={() => nav(STATIC_LINKS.CATALOG)}>
                    Перейти в каталог
                </Button>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Моё обучение</Title>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {items.map(({ enrollment, course }) => {
                    const percent = enrollment.progressPercent ?? 0;
                    const isCompleted = enrollment.status === "COMPLETED";

                    return (
                        <Card
                            key={enrollment.id}
                            withBorder
                            radius="lg"
                            padding="md"
                            shadow="sm"
                        >
                            <Stack gap="xs">
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Title order={4} lineClamp={2}>
                                            {course?.title ?? "Курс"}
                                        </Title>
                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                            {course?.description}
                                        </Text>
                                    </Stack>

                                    <Badge
                                        variant="light"
                                        color={isCompleted ? "green" : "blue"}
                                    >
                                        {isCompleted ? "Завершён" : "В процессе"}
                                    </Badge>
                                </Group>

                                <Stack gap={4}>
                                    <Group justify="space-between">
                                        <Text size="sm" fw={500}>
                                            Прогресс
                                        </Text>
                                        <Text size="sm">{percent}%</Text>
                                    </Group>
                                    <Progress value={percent} />
                                </Stack>

                                <Group justify="space-between" mt="xs">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        onClick={() =>
                                            course &&
                                            nav(STATIC_LINKS.COURSE_BY_ID(course.id))
                                        }
                                    >
                                        Продолжить
                                    </Button>
                                </Group>
                            </Stack>
                        </Card>
                    );
                })}
            </SimpleGrid>
        </Stack>
    );
}
