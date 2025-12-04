// features/course/ui/CourseLearningSection.tsx
//
// Основной UI-блок страницы курса (для студента).
// Теперь итоговый тест — отдельный элемент списка слева.
// При выборе теста его содержимое показывается вместо текста урока справа.

import { observer } from "mobx-react-lite";
import {
    Badge,
    Button,
    Card,
    Checkbox,
    Group,
    Loader,
    Paper,
    Progress,
    Stack,
    Text,
    Title,
    ScrollArea,
    Radio,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import courseLearningStore from "@/features/course/model/courseLearningStore";
import type {
    TestQuestion,
    TestSubmissionRequest,
} from "@/features/course/api/CourseLearningService";
import LessonContentRenderer from "@/features/course/ui/LessonContentRenderer";
import CourseReviewsSection from "@/features/course/ui/CourseReviewsSection";

type ViewMode = "lesson" | "test";

const CourseLearningSection = observer(() => {
    const { id: courseId } = useParams<{ id: string }>();
    const store = courseLearningStore;

    // какой режим сейчас выбран: просмотр урока или теста
    const [viewMode, setViewMode] = useState<ViewMode>("lesson");

    // локальное состояние ответов на тест: { [questionId]: string[] }
    const [answers, setAnswers] = useState<Record<string, string[]>>({});

    // инициализация стора при смене courseId
    useEffect(() => {
        if (!courseId) return;

        store.init(courseId);
        setViewMode("lesson");
        setAnswers({});

        return () => {
            store.reset();
            setAnswers({});
        };
    }, [courseId, store]);

// тест доступен? (если backend говорит testAvailable === false — считаем недоступным)
    const isTestAvailable = store.progress?.testAvailable !== false;

// более "человеческий" прогресс: уроки + тест как единицы
    const totalLessons = store.progress?.totalLessons ?? store.lessons.length ?? 0;
    const completedLessons = store.progress?.completedLessons ?? 0;

    const testPassed = !!store.progress?.latestTestAttempt?.passed;

    const totalUnits = totalLessons + (isTestAvailable ? 1 : 0);
    const completedUnits = completedLessons + (isTestAvailable && testPassed ? 1 : 0);

    const progressPercent =
        totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;

    // const lessonsPercent =
    //     totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;


    // урок считается пройденным, если его индекс <= индекса последнего завершённого
    const isLessonCompleted = (lessonId: string): boolean => {
        const progress = store.progress;
        if (!progress || !progress.lastCompletedLessonId) return false;

        const lastIndex = store.lessons.findIndex(
            (l) => l.id === progress.lastCompletedLessonId,
        );
        const currentIndex = store.lessons.findIndex((l) => l.id === lessonId);

        if (lastIndex === -1 || currentIndex === -1) return false;

        return currentIndex <= lastIndex;
    };

    // можно ли отметить текущий урок пройденным
    const canCompleteCurrentLesson = (): boolean => {
        if (!store.isEnrolled || !store.currentLesson) return false;

        const lessons = store.lessons;
        if (!lessons.length) return false;

        const currentIndex = lessons.findIndex(
            (l) => l.id === store.currentLesson!.id,
        );
        if (currentIndex === -1) return false;

        const progress = store.progress;
        if (!progress || !progress.lastCompletedLessonId) {
            // ещё ничего не проходили — можно отметить только первый урок
            return currentIndex === 0;
        }

        const lastIndex = lessons.findIndex(
            (l) => l.id === progress.lastCompletedLessonId,
        );
        if (lastIndex === -1) {
            // если бэк не знает, что пройдено — тоже считаем, что начинаем с первого
            return currentIndex === 0;
        }

        // разрешаем отмечать только следующий после последнего пройденного
        return currentIndex === lastIndex + 1;
    };


    // есть ли хоть какие-то ответы на тест
    const hasAnyAnswers = useMemo(
        () => Object.values(answers).some((arr) => arr.length > 0),
        [answers],
    );

    const handleEnroll = async () => {
        if (!courseId) return;
        await store.enroll(courseId);
    };

    const handleLessonClick = (lessonId: string) => {
        store.setCurrentLesson(lessonId);
        setViewMode("lesson");
    };

    const handleCompleteLesson = async () => {
        if (!courseId || !store.currentLesson) return;
        await store.completeLesson(courseId, store.currentLesson.id);
    };

    // выбор теста в колонке слева
    const handleSelectTest = async () => {
        setViewMode("test");

        if (!courseId) return;
        if (!store.isEnrolled) return;
        if (!isTestAvailable) return;

        // если тест ещё не загружен — грузим
        if (!store.test && !store.isLoadingTest) {
            setAnswers({});
            await store.loadTest(courseId);
        }
    };

    const handleChangeAnswer = (question: TestQuestion, optionKey: string) => {
        setAnswers((prev) => {
            const prevForQuestion = prev[question.id] ?? [];

            if (question.multiple) {
                // чекбоксы
                const exists = prevForQuestion.includes(optionKey);
                const next = exists
                    ? prevForQuestion.filter((k) => k !== optionKey)
                    : [...prevForQuestion, optionKey];
                return { ...prev, [question.id]: next };
            }

            // одиночный выбор
            return { ...prev, [question.id]: [optionKey] };
        });
    };

    const handleSubmitTest = async () => {
        if (!courseId || !store.test) return;

        const payload: TestSubmissionRequest = {
            answers,
        };

        await store.submitTest(courseId, payload);
    };

    const isLoadingAll =
        store.isLoadingCourse || store.isLoadingLessons || store.isLoadingProgress;

    if (!courseId) {
        return <Text>Не указан идентификатор курса.</Text>;
    }

    return (
        <Stack gap="md">
            {/* Заголовок курса + прогресс / запись */}
            <Group justify="space-between" align="flex-start">
                <Stack gap={4} maw={600}>
                    <Title order={2}>{store.course?.title ?? "Курс"}</Title>
                    <Text c="dimmed" size="sm">
                        {store.course?.description}
                    </Text>
                </Stack>

                <Stack align="flex-end" gap={4} miw={260}>
                    <Stack gap={2} align="flex-end">
                        <Group gap="xs" align="center">
                            <Text size="sm" fw={500}>
                                Прогресс курса:
                            </Text>
                            <Text size="sm">{progressPercent.toFixed(0)}%</Text>
                        </Group>
                        <Progress value={progressPercent} w={220} />

                        <Group gap="xs">
                            <Text size="xs" c="dimmed">
                                Уроки: {completedLessons}/{totalLessons}
                            </Text>
                            {isTestAvailable && (
                                <Text size="xs" c="dimmed">
                                    Тест: {testPassed ? "пройден" : "не пройден"}
                                </Text>
                            )}
                        </Group>
                    </Stack>

                    <Group gap="xs">
                        {store.isEnrolled ? (
                            <Badge color="green" variant="light">
                                Вы записаны на курс
                            </Badge>
                        ) : (
                            <Button
                                onClick={handleEnroll}
                                loading={store.isEnrolling}
                                disabled={store.isEnrolling}
                                size="sm"
                            >
                                Записаться на курс
                            </Button>
                        )}
                    </Group>

                    {store.progress?.latestTestAttempt && (
                        <Text size="xs" c="dimmed">
                            Последняя попытка теста:{" "}
                            {store.progress.latestTestAttempt.scorePercent.toFixed(0)}%,{" "}
                            {store.progress.latestTestAttempt.passed ? "зачёт" : "незачёт"}
                        </Text>
                    )}
                </Stack>

            </Group>

            <Group align="flex-start" grow gap="md">
                {/* ЛЕВАЯ КОЛОНКА: список уроков + карточка теста внизу */}
                <Paper withBorder radius="lg" p="md" miw={260} maw={320}>
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text fw={600}>Уроки</Text>
                            {store.isLoadingLessons && <Loader size="xs" />}
                        </Group>

                        <ScrollArea h={360}>
                            <Stack gap={6}>
                                {store.lessons.map((lesson, idx) => {
                                    const isActive =
                                        viewMode === "lesson" &&
                                        lesson.id === store.currentLessonId;
                                    const completed = isLessonCompleted(lesson.id);

                                    return (
                                        <Card
                                            key={lesson.id}
                                            withBorder
                                            radius="md"
                                            p="sm"
                                            onClick={() => handleLessonClick(lesson.id)}
                                            style={{
                                                cursor: "pointer",
                                                borderColor: isActive ? "#3b82f6" : undefined,
                                                backgroundColor: isActive ? "#eff6ff" : undefined,
                                            }}
                                        >
                                            <Group justify="space-between" align="flex-start">
                                                <Stack gap={2} maw="70%">
                                                    <Text size="sm" fw={500}>
                                                        {idx + 1}. {lesson.title}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        Урок #{lesson.orderIndex ?? idx + 1}
                                                    </Text>
                                                </Stack>
                                                <Badge
                                                    size="xs"
                                                    color={completed ? "green" : "gray"}
                                                    variant={completed ? "light" : "outline"}
                                                >
                                                    {completed ? "Пройдено" : "Не пройдено"}
                                                </Badge>
                                            </Group>
                                        </Card>
                                    );
                                })}

                                {store.lessons.length === 0 && !store.isLoadingLessons && (
                                    <Text size="sm" c="dimmed">
                                        Уроки ещё не добавлены.
                                    </Text>
                                )}

                                {/* КАРТОЧКА ТЕСТА — ВСЕГДА ВНИЗУ */}
                                <Card
                                    withBorder
                                    radius="md"
                                    p="sm"
                                    mt="xs"
                                    onClick={
                                        store.isEnrolled ? () => void handleSelectTest() : undefined
                                    }
                                    style={{
                                        cursor: store.isEnrolled ? "pointer" : "not-allowed",
                                        borderColor: viewMode === "test" ? "#3b82f6" : undefined,
                                        backgroundColor:
                                            viewMode === "test" ? "#eff6ff" : undefined,
                                        opacity: !store.isEnrolled ? 0.6 : 1,
                                    }}
                                >
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap={2}>
                                            <Text size="sm" fw={500}>
                                                Итоговый тест
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                Проверка знаний по всему курсу.
                                            </Text>
                                        </Stack>

                                        <Stack gap={4} align="flex-end">
                                            <Badge
                                                size="xs"
                                                color={
                                                    !store.isEnrolled
                                                        ? "gray"
                                                        : !isTestAvailable
                                                            ? "gray"
                                                            : testPassed
                                                                ? "green"
                                                                : "blue"
                                                }
                                                variant={
                                                    isTestAvailable
                                                        ? testPassed
                                                            ? "light"
                                                            : "outline"
                                                        : "outline"
                                                }
                                            >
                                                {!store.isEnrolled
                                                    ? "Недоступен"
                                                    : !isTestAvailable
                                                        ? "Появится позже"
                                                        : testPassed
                                                            ? "Пройден"
                                                            : "Доступен"}
                                            </Badge>

                                            {store.progress?.latestTestAttempt && (
                                                <Text size="xs" c="dimmed">
                                                    {store.progress.latestTestAttempt.scorePercent}% /
                                                    {store.progress.latestTestAttempt.passed
                                                        ? "зачёт"
                                                        : "незачёт"}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Group>
                                </Card>
                            </Stack>
                        </ScrollArea>

                        {store.currentLesson && viewMode === "lesson" && (
                            <>
                                <Button
                                    mt="sm"
                                    variant="light"
                                    fullWidth
                                    onClick={handleCompleteLesson}
                                    disabled={!canCompleteCurrentLesson()}
                                >
                                    {isLessonCompleted(store.currentLesson.id)
                                        ? "Урок уже пройден"
                                        : "Отметить урок пройденным"}
                                </Button>

                                {!canCompleteCurrentLesson() &&
                                    !isLessonCompleted(store.currentLesson.id) && (
                                        <Text size="xs" c="dimmed" mt={4}>
                                            Чтобы отметить этот урок, сначала завершите предыдущие.
                                        </Text>
                                    )}
                            </>
                        )}


                        {!store.isEnrolled && (
                            <Text size="xs" c="dimmed">
                                Чтобы фиксировать прогресс и пройти итоговый тест,
                                сначала запишитесь на курс.
                            </Text>
                        )}
                    </Stack>
                </Paper>

                {/* ПРАВАЯ КОЛОНКА: либо контент урока, либо тест */}
                <Paper withBorder radius="lg" p="md" style={{ flex: 1 }}>
                    {viewMode === "lesson" ? (
                        // ----- РЕЖИМ УРОКА -----
                        isLoadingAll ? (
                            <Group justify="center" align="center" h="100%">
                                <Loader />
                            </Group>
                        ) : (
                            <Stack gap="sm" h="100%">
                                <Group justify="space-between" align="center">
                                    <Title order={3}>
                                        {store.currentLesson?.title ?? "Урок не выбран"}
                                    </Title>
                                </Group>

                                <Stack>
                                    <LessonContentRenderer lesson={store.currentLesson} />
                                </Stack>
                            </Stack>
                        )
                    ) : (
                        // ----- РЕЖИМ ТЕСТА -----
                        <Stack gap="sm" h="100%">
                            <Group justify="space-between" align="center">
                                <Title order={3}>Итоговый тест</Title>
                            </Group>

                            {!store.isEnrolled && (
                                <Text size="sm" c="dimmed">
                                    Тест доступен только для записанных студентов.
                                </Text>
                            )}

                            {store.isEnrolled && !isTestAvailable && (
                                <Text size="sm" c="dimmed">
                                    Тест станет доступен после выполнения условий курса
                                    (например, прохождения всех уроков).
                                </Text>
                            )}

                            {store.isEnrolled && isTestAvailable && store.isLoadingTest && !store.test && (
                                <Group justify="center" align="center" h={200}>
                                    <Loader />
                                </Group>
                            )}

                            {store.isEnrolled && isTestAvailable && store.test && (
                                <Stack gap="sm">
                                    <Text fw={500}>
                                        {store.test.title}
                                    </Text>
                                    <Text fw={400}>
                                        (минимум для зачёта:{" "} {store.test.passingScore})
                                    </Text>

                                    <ScrollArea>
                                        <Stack gap="md">
                                            {store.test.questions.map((q, index) => (
                                                <Card
                                                    key={q.id}
                                                    withBorder
                                                    radius="md"
                                                    p="sm"
                                                    shadow="xs"
                                                >
                                                    <Stack gap={6}>
                                                        <Text fw={500}>
                                                            {index + 1}. {q.title}
                                                        </Text>
                                                        <Stack gap={4}>
                                                            {q.multiple
                                                                ? q.options.map((opt) => (
                                                                    <Checkbox
                                                                        key={opt.key}
                                                                        label={opt.label}
                                                                        checked={(
                                                                            answers[q.id] ?? []
                                                                        ).includes(opt.key)}
                                                                        onChange={() =>
                                                                            handleChangeAnswer(q, opt.key)
                                                                        }
                                                                    />
                                                                ))
                                                                : q.options.map((opt) => (
                                                                    <Radio
                                                                        key={opt.key}
                                                                        label={opt.label}
                                                                        value={opt.key}
                                                                        checked={
                                                                            (answers[q.id] ?? [])[0] === opt.key
                                                                        }
                                                                        onChange={() =>
                                                                            handleChangeAnswer(q, opt.key)
                                                                        }
                                                                    />
                                                                ))}
                                                        </Stack>
                                                    </Stack>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </ScrollArea>

                                    <Group justify="flex-end" mt="sm">
                                        <Button
                                            onClick={handleSubmitTest}
                                            loading={store.isSubmittingTest}
                                            disabled={
                                                store.isSubmittingTest ||
                                                !hasAnyAnswers ||
                                                !store.isEnrolled
                                            }
                                        >
                                            Отправить ответы
                                        </Button>
                                    </Group>
                                </Stack>
                            )}
                        </Stack>
                    )}


                </Paper>

            </Group>
            {courseId && (
                <Card withBorder radius="md" mt="lg">
                    <CourseReviewsSection courseId={courseId} />
                </Card>
            )}
        </Stack>
    );
});

export default CourseLearningSection;
