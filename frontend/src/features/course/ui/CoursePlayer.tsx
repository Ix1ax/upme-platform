// Компонент просмотра курса:
// - грузит данные курса, уроки, прогресс и статус записи;
// - даёт записаться на курс;
// - позволяет отмечать уроки пройденными;
// - показывает прогресс по курсу.
//
// Здесь мы опираемся на методы из MyCoursesService,
// хотя он называется "MyCourses" — по сути это общий сервис по курсам.

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Badge,
    Button,
    Group,
    Loader,
    Paper,
    Progress,
    Stack,
    Text,
    Title,
    List,
    ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconCircle } from "@tabler/icons-react";
import MyCoursesService, {
    type CourseDTO,
    type LessonDTO,
    type CourseProgressDTO,
    type EnrollmentDTO,
} from "@/features/MyCourses/api/MyCoursesService";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";

type RouteParams = {
    id: string;
};

export default function CoursePlayer() {
    const { id } = useParams<RouteParams>();
    const nav = useNavigate();

    // ==== Состояния ====

    // Данные курса (title, description и т.п.)
    const [course, setCourse] = useState<CourseDTO | null>(null);
    // Уроки курса
    const [lessons, setLessons] = useState<LessonDTO[]>([]);
    // Прогресс пользователя по курсу (может быть null, если не авторизован)
    const [progress, setProgress] = useState<CourseProgressDTO | null>(null);
    // Статус записи на курс (может быть null, если не авторизован или не записан)
    const [enrollment, setEnrollment] = useState<EnrollmentDTO | null>(null);

    // Общий флаг загрузки страницы
    const [loading, setLoading] = useState<boolean>(true);
    // Отдельные флаги под действия
    const [enrollLoading, setEnrollLoading] = useState<boolean>(false);
    const [completeLessonLoading, setCompleteLessonLoading] = useState<string | null>(null);

    // Текст ошибки, который можно показать пользователю
    const [error, setError] = useState<string | null>(null);

    // ==== Хелпер: загрузить прогресс и запись (мы вызываем это в нескольких местах) ====
    const loadProgressAndEnrollment = useCallback(
        async (courseId: string) => {
            try {
                // Прогресс и запись — только для авторизованных пользователей.
                // Если backend вернёт 401 — просто молча игнорируем (значит, гость).
                try {
                    const progressRes = await MyCoursesService.getCourseProgress(courseId);
                    setProgress(progressRes.data);
                } catch (e) {
                    console.error(e)
                    setProgress(null);
                }

                try {
                    const enrollRes = await MyCoursesService.getEnrollmentStatus(courseId);
                    setEnrollment(enrollRes.data);
                } catch (e) {
                    console.error(e)
                    setEnrollment(null);
                }
            } catch (e) {
                console.error("Ошибка загрузки прогресса/записи:", e);
            }
        },
        [],
    );

    // ==== Начальная загрузка курса и уроков ====
    useEffect(() => {
        if (!id) return;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Загружаем данные курса
                const courseRes = await MyCoursesService.getCourseById(id);
                setCourse(courseRes.data);

                // 2. Загружаем уроки курса
                const lessonsRes = await MyCoursesService.getLessons(id);

                // На всякий случай сортируем по orderIndex
                const sortedLessons = [...(lessonsRes.data ?? [])].sort(
                    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
                );
                setLessons(sortedLessons);

                // 3. Загружаем прогресс и статус записи, если пользователь авторизован
                await loadProgressAndEnrollment(id);
            } catch (e) {
                console.error("Ошибка загрузки курса:", e);
                setError("Не удалось загрузить курс. Попробуйте обновить страницу.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, loadProgressAndEnrollment]);

    // ==== Хелперы для отображения ====

    // Насколько курс уже пройден (0–100)
    const progressPercent = progress?.progressPercent ?? 0;

    // Статус пользователя по курсу
    const enrollmentStatusLabel = (() => {
        if (!enrollment) return "Не записан";
        switch (enrollment.status) {
            case "ACTIVE":
                return "Обучается";
            case "COMPLETED":
                return "Курс пройден";
            case "CANCELLED":
                return "Запись отменена";
            default:
                return enrollment.status;
        }
    })();

    // Простейшая логика: считаем, что все уроки ДО последнего завершённого тоже завершены.
    // Это подходит, если курс проходится линейно.
    const isLessonCompleted = (_lesson: LessonDTO, index: number): boolean => {
        if (!progress || !progress.lastCompletedLessonId) return false;

        const lastIndex = lessons.findIndex(
            (l) => l.id === progress.lastCompletedLessonId,
        );
        if (lastIndex === -1) return false;

        return index <= lastIndex;
    };

    // ==== Действия ====

    // Записаться на курс
    const handleEnroll = async () => {
        if (!id) return;
        setEnrollLoading(true);
        setError(null);

        try {
            const res = await MyCoursesService.enrollToCourse(id);
            setEnrollment(res.data);

            // После записи сразу подгружаем прогресс
            await loadProgressAndEnrollment(id);
        } catch (e: any) {
            console.error("Ошибка записи на курс:", e);

            // Если backend вернул 401 — значит, пользователь не авторизован
            if (e?.response?.status === 401) {
                setError("Чтобы записаться на курс, войдите в систему.");
            } else {
                setError("Не удалось записаться на курс. Попробуйте позже.");
            }
        } finally {
            setEnrollLoading(false);
        }
    };

    // Отметить урок пройденным
    const handleCompleteLesson = async (lessonId: string) => {
        if (!id) return;

        setCompleteLessonLoading(lessonId);
        setError(null);

        try {
            await MyCoursesService.completeLesson(id, lessonId);
            // После успешной отметки перезагружаем прогресс
            await loadProgressAndEnrollment(id);
        } catch (e: any) {
            console.error("Ошибка отметки урока как пройденного:", e);
            if (e?.response?.status === 401) {
                setError("Чтобы проходить курс и отмечать уроки, войдите в систему.");
            } else {
                setError("Не удалось обновить прогресс. Попробуйте ещё раз.");
            }
        } finally {
            setCompleteLessonLoading(null);
        }
    };

    // ==== Разметка ====

    if (!id) {
        return (
            <Text c="red">
                Не указан идентификатор курса в адресной строке.
            </Text>
        );
    }

    if (loading) {
        return (
            <Group justify="center" mt="xl">
                <Loader />
            </Group>
        );
    }

    if (!course) {
        return (
            <Stack>
                <Text c="red">
                    Курс не найден или произошла ошибка при загрузке.
                </Text>
                <Button variant="light" onClick={() => nav(STATIC_LINKS.CATALOG)}>
                    Вернуться в каталог
                </Button>
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            {/* Верхний блок: заголовок курса и общий статус */}
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Title order={2}>{course.title}</Title>
                    <Text c="dimmed" maw={700}>
                        {course.description}
                    </Text>
                </Stack>

                <Stack gap={8} align="flex-end">
                    <Badge
                        variant="light"
                        color={course.published ? "green" : "gray"}
                    >
                        {course.published ? "Опубликован" : "Черновик"}
                    </Badge>

                    <Badge
                        variant="outline"
                        color={enrollment ? "blue" : "gray"}
                    >
                        {enrollmentStatusLabel}
                    </Badge>

                    {/* Кнопка записи на курс */}
                    {!enrollment && (
                        <Button
                            size="sm"
                            loading={enrollLoading}
                            onClick={handleEnroll}
                        >
                            Записаться на курс
                        </Button>
                    )}
                </Stack>
            </Group>

            {/* Прогресс по курсу */}
            {enrollment && (
                <Paper p="md" radius="lg" withBorder>
                    <Group justify="space-between" align="center">
                        <Stack gap={4}>
                            <Text fw={500}>Прогресс по курсу</Text>
                            <Text size="sm" c="dimmed">
                                Завершено уроков:{" "}
                                {progress?.completedLessons ?? 0} из{" "}
                                {progress?.totalLessons ?? lessons.length}
                            </Text>
                        </Stack>
                        <Text fw={500}>{progressPercent.toFixed(0)}%</Text>
                    </Group>

                    <Progress
                        value={progressPercent}
                        mt="sm"
                        radius="xl"
                    />

                    {/* Информация о тесте, если backend её отдаёт */}
                    {progress?.latestTestAttempt && (
                        <Text size="sm" c="dimmed" mt="sm">
                            Последняя попытка теста:{" "}
                            {progress.latestTestAttempt.scorePercent.toFixed(0)}% —{" "}
                            {progress.latestTestAttempt.passed ? "сдан" : "не сдан"}
                        </Text>
                    )}

                    {progress?.testAvailable === false && (
                        <Text size="sm" c="dimmed" mt="xs">
                            Итоговый тест пока недоступен. Он появится после прохождения всех уроков.
                        </Text>
                    )}
                </Paper>
            )}

            {/* Ошибка (если есть) */}
            {error && (
                <Paper p="sm" radius="md" withBorder bg="red.0">
                    <Text size="sm" c="red">
                        {error}
                    </Text>
                </Paper>
            )}

            {/* Список уроков */}
            <Paper p="md" radius="lg" withBorder>
                <Title order={4} mb="sm">
                    Уроки курса
                </Title>

                {lessons.length === 0 ? (
                    <Text size="sm" c="dimmed">
                        В этом курсе пока нет уроков.
                    </Text>
                ) : (
                    <List spacing="sm">
                        {lessons.map((lesson, index) => {
                            const completed = isLessonCompleted(lesson, index);
                            const isCurrentAction = completeLessonLoading === lesson.id;

                            return (
                                <List.Item
                                    key={lesson.id}
                                    icon={
                                        <ThemeIcon
                                            size={24}
                                            radius="xl"
                                            variant={completed ? "filled" : "light"}
                                            color={completed ? "green" : "gray"}
                                        >
                                            {completed ? (
                                                <IconCheck size={16} />
                                            ) : (
                                                <IconCircle size={16} />
                                            )}
                                        </ThemeIcon>
                                    }
                                >
                                    <Group justify="space-between" align="center">
                                        <Stack gap={2} maw="70%">
                                            <Text fw={500}>{lesson.title}</Text>
                                            <Text size="xs" c="dimmed">
                                                Урок #{lesson.orderIndex ?? index + 1}
                                            </Text>
                                        </Stack>

                                        <Group gap="xs">
                                            {/* Кнопка "Отметить пройденным" доступна только
                          для тех, кто записан на курс */}
                                            {enrollment && !completed && (
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    loading={isCurrentAction}
                                                    onClick={() => handleCompleteLesson(lesson.id)}
                                                >
                                                    Отметить пройденным
                                                </Button>
                                            )}

                                            {completed && (
                                                <Badge size="sm" color="green" variant="light">
                                                    Пройдено
                                                </Badge>
                                            )}
                                        </Group>
                                    </Group>
                                </List.Item>
                            );
                        })}
                    </List>
                )}
            </Paper>

            <Group justify="space-between">
                <Button
                    variant="subtle"
                    onClick={() => nav(-1)}
                >
                    Назад
                </Button>

                <Button
                    variant="light"
                    onClick={() => nav(STATIC_LINKS.CATALOG)}
                >
                    В каталог
                </Button>
            </Group>
        </Stack>
    );
}
