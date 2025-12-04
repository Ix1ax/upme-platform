// src/features/MyCourses/ui/CourseLessonsEditor.tsx

import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Group,
    Stack,
    Text,
    TextInput,
    Textarea,
    NumberInput,
    ScrollArea,
    Badge,
    Loader,
} from "@mantine/core";
import MyCoursesService, {
    type CourseLessonDTO,
    type CourseLessonPayload,
} from "@/features/MyCourses/api/MyCoursesService";
import LessonRichTextEditor from "./LessonRichTextEditor";
import CourseWebinarEditor from "./CourseWebinarEditor";


type Props = {
    courseId: string;
};

type LessonFormState = {
    title: string;
    description: string;
    orderIndex: number;
    contentHtml: string;
};

const DEFAULT_HTML = "<p>Напишите текст урока...</p>";

const createEmptyForm = (orderIndex = 1): LessonFormState => ({
    title: "",
    description: "",
    orderIndex,
    contentHtml: DEFAULT_HTML,
});

// аккуратно выдёргиваем html из любого content, который нам приходит с бэка
// аккуратно выдёргиваем html из любого content, который нам приходит с бэка
const extractHtmlFromContent = (content: unknown): string => {
    if (!content) return DEFAULT_HTML;

    if (typeof content === "string") {
        // если вдруг на бэке просто строка
        return content || DEFAULT_HTML;
    }

    if (typeof content === "object") {
        const maybe = content as { html?: unknown; blocks?: any[] };

        // обычный урок: { html: "<p>...</p>" }
        if (typeof maybe.html === "string" && maybe.html.trim().length > 0) {
            return maybe.html;
        }

        // вебинар или сложный контент: ищем текстовый блок
        if (Array.isArray(maybe.blocks)) {
            const textBlock = maybe.blocks.find(
                (b: any) =>
                    b &&
                    (b.type === "text" || b.type === "rich-text") &&
                    typeof b.html === "string" &&
                    b.html.trim().length > 0,
            );
            if (textBlock) {
                return (textBlock as any).html;
            }
        }
    }

    return DEFAULT_HTML;
};


const isWebinarLesson = (lesson: CourseLessonDTO): boolean => {
    const content: any = lesson.content;
    if (!content || typeof content !== "object") return false;

    if (content.type === "webinar") return true;
    if (Array.isArray(content.blocks)) {
        return content.blocks.some((b: any) => b?.type === "video");
    }
    return false;
};

const extractVideoUrlFromContent = (content: unknown): string | null => {
    if (!content || typeof content !== "object") return null;
    const obj: any = content;

    if (Array.isArray(obj.blocks)) {
        const videoBlock = obj.blocks.find(
            (b: any) => b && b.type === "video" && typeof b.url === "string",
        );
        return videoBlock?.url ?? null;
    }

    return null;
};



const CourseLessonsEditor: React.FC<Props> = ({ courseId }) => {
    const [lessons, setLessons] = useState<CourseLessonDTO[]>([]);
    const [selectedId, setSelectedId] = useState<string | "new">("new");
    const [form, setForm] = useState<LessonFormState>(() => createEmptyForm(1));
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [webinarModalOpen, setWebinarModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

    const loadLessons = async () => {
        try {
            setIsLoadingList(true);
            const res = await MyCoursesService.getCourseLessons(courseId);

            const list = res.data ?? [];
            setLessons(list);

            if (list.length > 0) {
                const first = list[0];
                setSelectedId(first.id);
                setForm({
                    title: first.title ?? "",
                    description: first.description ?? "",
                    orderIndex: first.orderIndex ?? 1,
                    contentHtml: extractHtmlFromContent(first.content),
                });
                setCurrentVideoUrl(extractVideoUrlFromContent(first.content)); // ← НОВОЕ
            } else {
                setSelectedId("new");
                setForm(createEmptyForm(1));
                setCurrentVideoUrl(null); // ← НОВОЕ
            }

        } catch (e) {
            console.error("Не удалось загрузить уроки курса", e);
        } finally {
            setIsLoadingList(false);
        }
    };


    // ------- Загрузка списка уроков --------
    useEffect(() => {
        loadLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);


    // ------- Выбор урока из списка --------
    const handleSelectLesson = (lesson: CourseLessonDTO) => {
        setSelectedId(lesson.id);
        setForm({
            title: lesson.title ?? "",
            description: lesson.description ?? "",
            orderIndex: lesson.orderIndex ?? 1,
            contentHtml: extractHtmlFromContent(lesson.content),
        });
        setCurrentVideoUrl(extractVideoUrlFromContent(lesson.content)); // ← НОВОЕ
    };


    // ------- Создание нового урока --------
    const handleCreateNew = () => {
        const nextOrder = lessons.length + 1;
        setSelectedId("new");
        setForm(createEmptyForm(nextOrder));
        setCurrentVideoUrl(null); // ← НОВОЕ
    };


    // ------- Обновление формы --------
    const updateForm = (patch: Partial<LessonFormState>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            alert("Введите название урока");
            return;
        }

        const existingLesson =
            selectedId === "new"
                ? null
                : lessons.find((l) => l.id === selectedId) ?? null;

        const isWebinar =
            existingLesson ? isWebinarLesson(existingLesson) : false;

        let contentObject: any;

        if (isWebinar) {
            // пытаемся достать видео из текущего контента, если нет — из стейта
            const videoUrl =
                extractVideoUrlFromContent(existingLesson?.content) ??
                currentVideoUrl;

            const blocks: any[] = [];

            if (videoUrl) {
                blocks.push({
                    type: "video",
                    url: videoUrl,
                });
            }

            // текст из редактора
            blocks.push({
                type: "text",
                html: form.contentHtml?.trim() || DEFAULT_HTML,
            });

            contentObject = {
                type: "webinar",
                blocks,
            };
        } else {
            // обычный урок
            contentObject = {
                type: "rich-text" as const,
                version: 1,
                html: form.contentHtml?.trim() || DEFAULT_HTML,
            };
        }

        const payload: CourseLessonPayload = {
            title: form.title.trim(),
            description: form.description.trim(),
            orderIndex: form.orderIndex || 1,
            content: contentObject,
        };

        try {
            setIsSaving(true);

            if (selectedId === "new") {
                const res = await MyCoursesService.createCourseLesson(
                    courseId,
                    payload,
                );
                const created = res.data;
                setLessons((prev) => [...prev, created]);
                setSelectedId(created.id);
                setCurrentVideoUrl(extractVideoUrlFromContent(created.content)); // на всякий
            } else {
                const res = await MyCoursesService.updateCourseLesson(
                    courseId,
                    selectedId,
                    payload,
                );
                const updated = res.data;
                setLessons((prev) =>
                    prev.map((l) => (l.id === updated.id ? updated : l)),
                );
                setCurrentVideoUrl(extractVideoUrlFromContent(updated.content)); // ОБНОВИТЬ
            }
        } catch (e) {
            console.error("Не удалось сохранить урок", e);
            alert("Ошибка при сохранении урока. Подробности в консоли.");
        } finally {
            setIsSaving(false);
        }
    };


    const handleDelete = async () => {
        if (selectedId === "new") {
            handleCreateNew();
            return;
        }

        const lesson = lessons.find((l) => l.id === selectedId);
        const title = lesson?.title ?? "урок";

        if (!window.confirm(`Удалить "${title}"?`)) return;

        try {
            setIsDeleting(true);
            await MyCoursesService.deleteCourseLesson(courseId, selectedId);

            const remaining = lessons.filter((l) => l.id !== selectedId);
            setLessons(remaining);

            if (remaining.length > 0) {
                const first = remaining[0];
                setSelectedId(first.id);
                setForm({
                    title: first.title ?? "",
                    description: first.description ?? "",
                    orderIndex: first.orderIndex ?? 1,
                    contentHtml: extractHtmlFromContent(first.content),
                });
                setCurrentVideoUrl(extractVideoUrlFromContent(first.content)); // ← НОВОЕ
            } else {
                setSelectedId("new");
                setForm(createEmptyForm(1));
                setCurrentVideoUrl(null); // ← НОВОЕ
            }

        } catch (e) {
            console.error("Не удалось удалить урок", e);
            alert("Ошибка при удалении урока. Подробности в консоли.");
        } finally {
            setIsDeleting(false);
        }
    };

    const currentIsNew = selectedId === "new";

    return (
        <Group align="flex-start" gap="lg" grow>
            {/* --------- Список уроков --------- */}
            <Card withBorder radius="md" style={{ width: "30%", minWidth: 260 }}>
                <Group position="apart" mb="sm">
                    <Text fw={600}>Уроки курса</Text>
                    {isLoadingList && <Loader size="xs" />}
                </Group>

                <ScrollArea style={{ maxHeight: 400 }}>
                    <Stack gap="xs">
                        {lessons.map((lesson) => {
                            const webinar = isWebinarLesson(lesson); // ← добавить

                            return (
                                <Card
                                    key={lesson.id}
                                    withBorder
                                    radius="md"
                                    p="sm"
                                    style={{
                                        cursor: "pointer",
                                        borderColor:
                                            selectedId === lesson.id
                                                ? "var(--mantine-color-blue-5)"
                                                : undefined,
                                    }}
                                    onClick={() => handleSelectLesson(lesson)}
                                >
                                    <Group position="apart" align="flex-start">
                                        <Stack gap={4} style={{maxWidth: "80%"}}>
                                            <Text size="sm" fw={600} lineClamp={2}>
                                                {lesson.title || "Без названия"}
                                            </Text>
                                            <Text size="xs" c="dimmed" lineClamp={2}>
                                                {lesson.description}
                                            </Text>
                                        </Stack>
                                        <Stack gap={4} align="flex-end">
                                            <Badge size="xs" variant="light">
                                                #{lesson.orderIndex ?? 0}
                                            </Badge>
                                            {webinar && (
                                                <Badge size="xs" color="violet" variant="outline">
                                                    Вебинар
                                                </Badge>
                                            )}
                                        </Stack>

                                    </Group>
                                </Card>
                            )
                        })}

                        {lessons.length === 0 && !isLoadingList && (
                            <Text size="sm" c="dimmed">
                                Уроков пока нет. Создай первый урок справа 👇
                            </Text>
                        )}
                    </Stack>
                </ScrollArea>

                <Group gap={"md"}>
                    <Button mt="md" variant="outline" fullWidth onClick={handleCreateNew}>
                        + Новый урок
                    </Button>
                    <Button
                        mt="xs"
                        variant="light"
                        fullWidth
                        onClick={() => setWebinarModalOpen(true)}
                    >
                        + Вебинар
                    </Button>
                </Group>

            </Card>

            {/* --------- Форма урока --------- */}
            <Card withBorder radius="md" miw="60%">
                <Group position="apart" mb="md">
                    <Text fw={600}>
                        {currentIsNew ? "Создание урока" : "Редактирование урока"}
                    </Text>
                    <Group gap="xs">
                        {!currentIsNew && (
                            <Button
                                color="red"
                                variant="subtle"
                                loading={isDeleting}
                                onClick={handleDelete}
                            >
                                Удалить
                            </Button>
                        )}
                        <Button loading={isSaving} onClick={handleSave}>
                            Сохранить
                        </Button>
                    </Group>
                </Group>

                <Stack gap="sm">
                    <Group grow align="flex-start">
                        <TextInput
                            label="Название"
                            placeholder="Например: Введение"
                            value={form.title}
                            onChange={(e) => updateForm({ title: e.target.value })}
                            required
                        />
                        <NumberInput
                            label="Порядок"
                            min={1}
                            value={form.orderIndex}
                            onChange={(val) =>
                                updateForm({
                                    orderIndex:
                                        typeof val === "number" && !Number.isNaN(val) ? val : 1,
                                })
                            }
                        />
                    </Group>

                    <Textarea
                        label="Краткое описание"
                        minRows={2}
                        autosize
                        placeholder="О чём этот урок?"
                        value={form.description}
                        onChange={(e) => updateForm({ description: e.target.value })}
                    />

                    <div>
                        <Text mb={4} fw={500}>
                            Контент урока
                        </Text>
                        <LessonRichTextEditor
                            value={form.contentHtml}
                            onChange={(html) => updateForm({ contentHtml: html })}
                        />
                    </div>
                </Stack>
            </Card>
            {/* Модалка создания вебинара */}
            <CourseWebinarEditor
                courseId={courseId}
                moduleId=""              // модулей пока нет, можно оставить пустую строку
                opened={webinarModalOpen}
                onClose={() => setWebinarModalOpen(false)}
                onCreated={loadLessons}  // после создания перезагрузка списка уроков
            />

        </Group>
    );
};

export default CourseLessonsEditor;
