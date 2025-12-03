import { useEffect, useState } from "react";
import {
    ActionIcon,
    Button,
    Card,
    Checkbox,
    Group,
    Loader,
    Modal,
    NumberInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import MyCoursesService, {
    type CourseTestDTO,
    type CourseTestPayload,
} from "@/features/MyCourses/api/MyCoursesService";

type Props = {
    courseId: string;
};

type Mode = "create" | "edit";

// Вариант ответа внутри вопроса (UI-формат)
type UiOption = {
    id: string;
    text: string;
    correct: boolean;
};

// Вопрос теста (UI-формат)
type UiQuestion = {
    id: string;
    text: string;
    options: UiOption[];
};

// Тип для JSON, который будем класть в questions
type BackendOption = {
    id?: string;
    key?: string;
    text?: string;
    correct?: boolean;
};

type BackendQuestion = {
    id?: string;
    key?: string;
    title?: string;   // текст вопроса
    text?: string;    // на всякий случай, если старые данные
    options?: BackendOption[];
};


const createId = () =>
    `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const createEmptyQuestion = (): UiQuestion => ({
    id: createId(),
    text: "",
    options: [
        { id: createId(), text: "", correct: true },
        { id: createId(), text: "", correct: false },
    ],
});

// Преобразуем то, что пришло с бека, в удобный формат для формы
const deserializeQuestions = (raw: unknown): UiQuestion[] => {
    if (!raw) return [];

    let value: unknown = raw;

    if (typeof raw === "string") {
        try {
            value = JSON.parse(raw);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(value)) return [];

    return (value as BackendQuestion[]).map((q, qIndex) => {
        const qId = q.id || q.key || `q${qIndex + 1}`;
        const questionText = q.title ?? q.text ?? "";

        const opts: UiOption[] = Array.isArray(q.options)
            ? q.options.map((o, oIndex) => ({
                id: o.key || o.id || `${qId}_o${oIndex + 1}`,
                text: o.label ?? o.text ?? "",
                correct: Boolean(o.correct),
            }))
            : [
                { id: createId(), text: "", correct: true },
                { id: createId(), text: "", correct: false },
            ];

        return {
            id: qId,
            text: questionText,
            options: opts.length
                ? opts
                : [
                    { id: createId(), text: "", correct: true },
                    { id: createId(), text: "", correct: false },
                ],
        };
    });
};


// Формируем JSON, который пойдёт в payload.questions
const serializeQuestions = (questions: UiQuestion[]): BackendQuestion[] => {
    return questions.map((q, qIndex) => {
        const qId = q.id || `q${qIndex + 1}`;

        const options = q.options.map((o, oIndex) => {
            const key = o.id || `${qId}_o${oIndex + 1}`;
            return {
                id: key,               // не обязательно, но можно
                key,
                label: o.text.trim(),  // ✅ текст варианта
                correct: o.correct,
            };
        });

        return {
            id: qId,                  // ✅ обязателен для бека
            key: qId,                 // можно для совместимости
            title: q.text.trim(),     // ✅ текст вопроса
            options,
        };
    });
};



export default function CourseTestEditor({ courseId }: Props) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [test, setTest] = useState<CourseTestDTO | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("create");

    const [title, setTitle] = useState("");
    const [passingScore, setPassingScore] = useState<number>(70);
    const [questions, setQuestions] = useState<UiQuestion[]>([]);

    const [formError, setFormError] = useState<string | null>(null);

    const loadTest = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const { data } = await MyCoursesService.getTestForManage(courseId);
            setTest(data);
        } catch (error: unknown) {
            const status = (error as any)?.response?.status;
            if (status === 404) {
                setTest(null);
            } else {
                console.error("Ошибка загрузки теста:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const openCreateModal = () => {
        setMode(test ? "edit" : "create");
        setTitle(test?.title ?? "");
        setPassingScore(test?.passingScore ?? 70);

        if (test?.questions) {
            setQuestions(deserializeQuestions(test.questions));
        } else {
            setQuestions([createEmptyQuestion()]);
        }

        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = () => {
        if (!test) return;
        setMode("edit");
        setTitle(test.title ?? "");
        setPassingScore(test.passingScore ?? 70);
        setQuestions(deserializeQuestions(test.questions));
        if (!deserializeQuestions(test.questions).length) {
            setQuestions([createEmptyQuestion()]);
        }
        setFormError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
    };

    const handleAddQuestion = () => {
        setQuestions((prev) => [...prev, createEmptyQuestion()]);
    };

    const handleRemoveQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, text } : q))
        );
    };

    const handleAddOption = (questionId: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: [
                            ...q.options,
                            { id: createId(), text: "", correct: false },
                        ],
                    }
                    : q
            )
        );
    };

    const handleRemoveOption = (questionId: string, optionId: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.filter((o) => o.id !== optionId),
                    }
                    : q
            )
        );
    };

    const handleOptionTextChange = (
        questionId: string,
        optionId: string,
        text: string
    ) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((o) =>
                            o.id === optionId ? { ...o, text } : o
                        ),
                    }
                    : q
            )
        );
    };

    const handleOptionCorrectToggle = (questionId: string, optionId: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((o) =>
                            o.id === optionId ? { ...o, correct: !o.correct } : o
                        ),
                    }
                    : q
            )
        );
    };

    const handleSave = async () => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) {
            setFormError("Укажите название теста.");
            return;
        }

        const cleanedQuestions = questions
            .map((q) => ({
                ...q,
                text: q.text.trim(),
                options: q.options
                    .map((o) => ({ ...o, text: o.text.trim() }))
                    .filter((o) => o.text.length > 0),
            }))
            .filter((q) => q.text.length > 0 && q.options.length >= 2);

        if (!cleanedQuestions.length) {
            setFormError(
                "Добавьте хотя бы один вопрос и минимум два варианта ответа."
            );
            return;
        }

        const hasQuestionWithoutCorrect = cleanedQuestions.some(
            (q) => !q.options.some((o) => o.correct)
        );
        if (hasQuestionWithoutCorrect) {
            setFormError(
                "У каждого вопроса должен быть хотя бы один правильный вариант."
            );
            return;
        }

        setFormError(null);

        const payload: CourseTestPayload = {
            title: normalizedTitle,
            passingScore: passingScore ?? 0,
            questions: serializeQuestions(cleanedQuestions),
        };

        try {
            setSaving(true);
            const { data } = await MyCoursesService.upsertTest(courseId, payload);
            setTest(data);
            setModalOpen(false);
        } catch (e) {
            console.error("Ошибка сохранения теста:", e);
            setFormError("Ошибка при сохранении теста. См. консоль.");
        } finally {
            setSaving(false);
        }
    };

    const questionsCount = (() => {
        if (!test?.questions) return null;
        const qs = deserializeQuestions(test.questions);
        return qs.length || null;
    })();

    return (
        <Card withBorder radius="lg" mt="lg">
            <Group justify="space-between" mb="md">
                <div>
                    <Text fw={600}>Итоговый тест по курсу</Text>
                    <Text size="sm" c="dimmed">
                        Здесь автор задаёт вопросы и варианты ответов. JSON больше руками
                        писать не нужно — всё собирается автоматически.
                    </Text>
                </div>

                {test ? (
                    <Button onClick={openEditModal} disabled={loading}>
                        Редактировать тест
                    </Button>
                ) : (
                    <Button onClick={openCreateModal} disabled={loading}>
                        Создать тест
                    </Button>
                )}
            </Group>

            {loading ? (
                <Group justify="center" py="lg">
                    <Loader />
                </Group>
            ) : test ? (
                <Stack gap="xs">
                    <Text>
                        <Text span fw={500}>
                            Название:
                        </Text>{" "}
                        {test.title}
                    </Text>
                    <Text>
                        <Text span fw={500}>
                            Проходной балл:
                        </Text>{" "}
                        {test.passingScore}
                    </Text>
                    {questionsCount !== null && (
                        <Text>
                            <Text span fw={500}>
                                Количество вопросов:
                            </Text>{" "}
                            {questionsCount}
                        </Text>
                    )}
                    <Text size="xs" c="dimmed">
                        Чтобы изменить структуру теста, открой «Редактировать тест».
                    </Text>
                </Stack>
            ) : (
                <Text size="sm" c="dimmed">
                    Итоговый тест пока не создан. Нажми «Создать тест», чтобы добавить его
                    к курсу.
                </Text>
            )}

            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={
                    mode === "create" ? "Создание итогового теста" : "Редактирование теста"
                }
                size="xl"
                centered
                scrollAreaComponent={undefined}
            >
                <Stack gap="md">
                    <TextInput
                        label="Название теста"
                        placeholder="Например: Итоговый тест по базовому Java"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />

                    <NumberInput
                        label="Проходной балл"
                        description="Сколько правильных ответов нужно набрать, чтобы тест считался пройденным."
                        min={0}
                        max={100}
                        value={passingScore}
                        onChange={(value) => {
                            const num = Number(value);
                            setPassingScore(Number.isFinite(num) ? num : 0);
                        }}

                    />

                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text fw={500}>Вопросы теста</Text>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                variant="outline"
                                size="xs"
                                onClick={handleAddQuestion}
                            >
                                Добавить вопрос
                            </Button>
                        </Group>

                        {questions.map((q, qIndex) => (
                            <Card key={q.id} withBorder radius="md">
                                <Group justify="space-between" align="flex-start" mb="xs">
                                    <Text fw={500}>Вопрос {qIndex + 1}</Text>
                                    {questions.length > 1 && (
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={() => handleRemoveQuestion(q.id)}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    )}
                                </Group>

                                <Stack gap="xs">
                                    <TextInput
                                        label="Текст вопроса"
                                        placeholder="Например: Какой тип данных в Java хранит целые числа?"
                                        value={q.text}
                                        onChange={(e) =>
                                            handleQuestionTextChange(q.id, e.currentTarget.value)
                                        }
                                    />

                                    <Stack gap={4} mt="xs">
                                        <Group justify="space-between">
                                            <Text size="sm" fw={500}>
                                                Варианты ответов
                                            </Text>
                                            <Button
                                                variant="light"
                                                size="xs"
                                                leftSection={<IconPlus size={14} />}
                                                onClick={() => handleAddOption(q.id)}
                                            >
                                                Добавить вариант
                                            </Button>
                                        </Group>

                                        {q.options.map((o) => (
                                            <Group key={o.id} align="center">
                                                <Checkbox
                                                    checked={o.correct}
                                                    onChange={() =>
                                                        handleOptionCorrectToggle(q.id, o.id)
                                                    }
                                                    title="Правильный ответ"
                                                />
                                                <TextInput
                                                    style={{ flex: 1 }}
                                                    placeholder="Текст варианта"
                                                    value={o.text}
                                                    onChange={(e) =>
                                                        handleOptionTextChange(
                                                            q.id,
                                                            o.id,
                                                            e.currentTarget.value
                                                        )
                                                    }
                                                />
                                                {q.options.length > 2 && (
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleRemoveOption(q.id, o.id)}
                                                    >
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                )}
                                            </Group>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Card>
                        ))}

                        {formError && (
                            <Text size="sm" c="red">
                                {formError}
                            </Text>
                        )}
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeModal} disabled={saving}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            Сохранить тест
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Card>
    );
}
