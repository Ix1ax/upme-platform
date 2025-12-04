// src/features/MyCourses/ui/CourseLessonsEditor.tsx

import React, { useEffect, useState } from "react";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import MyCoursesService, {
    type CourseLessonDTO,
    type CourseLessonPayload,
} from "@/features/MyCourses/api/MyCoursesService";
import LessonRichTextEditor from "./LessonRichTextEditor";
import CourseWebinarEditor from "./CourseWebinarEditor";

type Props = {
    courseId: string;
};

// 🔥 orderIndex из формы убрали — он только на бэке
type LessonFormState = {
    title: string;
    description: string;
    contentHtml: string;
};

const DEFAULT_HTML = "<p>Напишите текст урока...</p>";

const createEmptyForm = (): LessonFormState => ({
    title: "",
    description: "",
    contentHtml: DEFAULT_HTML,
});

// аккуратно выдёргиваем html из любого content, который нам приходит с бэка
const extractHtmlFromContent = (content: unknown): string => {
    if (!content) return DEFAULT_HTML;

    if (typeof content === "string") {
        return content || DEFAULT_HTML;
    }

    if (typeof content === "object") {
        const maybe = content as { html?: unknown; blocks?: any[] };

        if (typeof maybe.html === "string" && maybe.html.trim().length > 0) {
            return maybe.html;
        }

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
    const [form, setForm] = useState<LessonFormState>(() => createEmptyForm());
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false); // 🔥 блокировка стрелок
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
                    contentHtml: extractHtmlFromContent(first.content),
                });
                setCurrentVideoUrl(extractVideoUrlFromContent(first.content));
            } else {
                setSelectedId("new");
                setForm(createEmptyForm());
                setCurrentVideoUrl(null);
            }
        } catch (e) {
            console.error("Не удалось загрузить уроки курса", e);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        loadLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Загрузка изображения для урока → MinIO → URL
    const handleUploadLessonImage = async (file: File): Promise<string> => {
        const ext = file.name.split(".").pop();
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const path = ext ? `lessons/${unique}.${ext}` : `lessons/${unique}`;

        const res = await MyCoursesService.uploadCourseAsset(courseId, file, path);

        const url =
            (res.data.publicUrl as string | undefined) ??
            (res.data.url as string | undefined);

        if (!url) {
            throw new Error("Backend не вернул publicUrl / url для изображения");
        }

        return url;
    };

    // ------- Выбор урока из списка --------
    const handleSelectLesson = (lesson: CourseLessonDTO) => {
        setSelectedId(lesson.id);
        setForm({
            title: lesson.title ?? "",
            description: lesson.description ?? "",
            contentHtml: extractHtmlFromContent(lesson.content),
        });
        setCurrentVideoUrl(extractVideoUrlFromContent(lesson.content));
    };

    // ------- Создание нового урока --------
    const handleCreateNew = () => {
        setSelectedId("new");
        setForm(createEmptyForm());
        setCurrentVideoUrl(null);
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

            blocks.push({
                type: "text",
                html: form.contentHtml?.trim() || DEFAULT_HTML,
            });

            contentObject = {
                type: "webinar",
                blocks,
            };
        } else {
            contentObject = {
                type: "rich-text" as const,
                version: 1,
                html: form.contentHtml?.trim() || DEFAULT_HTML,
            };
        }

        const payload: CourseLessonPayload = {
            title: form.title.trim(),
            description: form.description.trim(),
            content: contentObject,
        };

        // 🔥 порядок не спрашиваем у пользователя:
        // для нового урока можно подсказать бэку индекс, иначе он сам расставит
        if (!existingLesson) {
            payload.orderIndex = lessons.length + 1;
        }

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
                setCurrentVideoUrl(extractVideoUrlFromContent(created.content));
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
                setCurrentVideoUrl(extractVideoUrlFromContent(updated.content));
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
                    contentHtml: extractHtmlFromContent(first.content),
                });
                setCurrentVideoUrl(extractVideoUrlFromContent(first.content));
            } else {
                setSelectedId("new");
                setForm(createEmptyForm());
                setCurrentVideoUrl(null);
            }
        } catch (e) {
            console.error("Не удалось удалить урок", e);
            alert("Ошибка при удалении урока. Подробности в консоли.");
        } finally {
            setIsDeleting(false);
        }
    };

    // ------- Перемещение уроков стрелочками --------
    const moveLesson = async (lessonId: string, direction: "up" | "down") => {
        const index = lessons.findIndex((l) => l.id === lessonId);
        if (index === -1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= lessons.length) return;

        const reordered = [...lessons];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);

        // пересчёт orderIndex локально
        const withOrder = reordered.map((l, idx) => ({
            ...l,
            orderIndex: idx + 1,
        }));

        setLessons(withOrder);
        setIsReordering(true);

        try {
            // простая синхронизация с бэком:
            await Promise.all(
                withOrder.map((lesson) =>
                    MyCoursesService.updateCourseLesson(courseId, lesson.id, {
                        title: lesson.title,
                        description: lesson.description,
                        content: lesson.content,
                        orderIndex: lesson.orderIndex,
                    }),
                ),
            );
        } catch (e) {
            console.error("Не удалось обновить порядок уроков", e);
            // на всякий случай перечитаем список
            await loadLessons();
        } finally {
            setIsReordering(false);
        }
    };

    const currentIsNew = selectedId === "new";

    return (
        <Group align="flex-start" gap="lg" grow>
            {/* --------- Список уроков --------- */}
            <Card withBorder radius="md" style={{ width: "30%", minWidth: 260 }}>
                <Group position="apart" mb="sm">
                    <Text fw={600}>Уроки курса</Text>
                    {(isLoadingList || isReordering) && <Loader size="xs" />}
                </Group>

                <ScrollArea style={{ maxHeight: 400 }}>
                    <Stack gap="xs">
                        {lessons.map((lesson, index) => {
                            const webinar = isWebinarLesson(lesson);

                            const canMoveUp = index > 0 && !isReordering;
                            const canMoveDown = index < lessons.length - 1 && !isReordering;

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
                                        transition: "border-color 120ms ease, box-shadow 120ms ease",
                                        boxShadow:
                                            selectedId === lesson.id
                                                ? "0 0 0 1px rgba(37, 99, 235, 0.25)"
                                                : "none",
                                    }}
                                    onClick={() => handleSelectLesson(lesson)}
                                >
                                    <Group wrap="nowrap" align="center" gap="sm">
                                        {/* ЛЕВАЯ КОЛОНКА: стрелки + номер */}
                                        <Stack
                                            gap={4}
                                            align="center"
                                            style={{
                                                padding: 4,
                                                borderRadius: 999,
                                                backgroundColor: "#f3f4f6",
                                                minWidth: 32,
                                            }}
                                            onClick={(e) => e.stopPropagation()} // чтобы клик по стрелкам не выбирал карточку
                                        >
                                            <Tooltip label="Переместить вверх" withArrow openDelay={150}>
                                                <ActionIcon
                                                    size="xs"
                                                    radius="xl"
                                                    variant={canMoveUp ? "light" : "subtle"}
                                                    color={canMoveUp ? "blue" : "gray"}
                                                    disabled={!canMoveUp}
                                                    onClick={() => moveLesson(lesson.id, "up")}
                                                >
                                                    <IconArrowUp size={14} />
                                                </ActionIcon>
                                            </Tooltip>

                                            <Text size="xs" c="dimmed">
                                                {index + 1}
                                            </Text>

                                            <Tooltip label="Переместить вниз" withArrow openDelay={150}>
                                                <ActionIcon
                                                    size="xs"
                                                    radius="xl"
                                                    variant={canMoveDown ? "light" : "subtle"}
                                                    color={canMoveDown ? "blue" : "gray"}
                                                    disabled={!canMoveDown}
                                                    onClick={() => moveLesson(lesson.id, "down")}
                                                >
                                                    <IconArrowDown size={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Stack>

                                        {/* ПРАВАЯ ЧАСТЬ: текст и бейджи */}
                                        <Group justify="space-between" align="flex-start" w="100%">
                                            <Stack gap={4} style={{ maxWidth: "70%" }}>
                                                <Text size="sm" fw={600} lineClamp={2}>
                                                    {lesson.title || "Без названия"}
                                                </Text>
                                                <Text size="xs" c="dimmed" lineClamp={2}>
                                                    {lesson.description}
                                                </Text>
                                            </Stack>

                                            <Stack gap={4} align="flex-end">
                                                {webinar && (
                                                    <Badge size="xs" color="violet" variant="outline">
                                                        Вебинар
                                                    </Badge>
                                                )}
                                            </Stack>
                                        </Group>
                                    </Group>
                                </Card>
                            );
                        })}


                        {lessons.length === 0 && !isLoadingList && (
                            <Text size="sm" c="dimmed">
                                Уроков пока нет. Создай первый урок справа 👇
                            </Text>
                        )}
                    </Stack>
                </ScrollArea>

                <Group gap="md">
                    <Button
                        mt="md"
                        variant="outline"
                        fullWidth
                        onClick={handleCreateNew}
                    >
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
                    <TextInput
                        label="Название"
                        placeholder="Например: Введение"
                        value={form.title}
                        onChange={(e) => updateForm({ title: e.target.value })}
                        required
                    />

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
                            onUploadImage={handleUploadLessonImage}
                        />
                    </div>
                </Stack>
            </Card>

            {/* Модалка создания вебинара */}
            <CourseWebinarEditor
                courseId={courseId}
                moduleId=""
                opened={webinarModalOpen}
                onClose={() => setWebinarModalOpen(false)}
                onCreated={loadLessons}
            />
        </Group>
    );
};

export default CourseLessonsEditor;
