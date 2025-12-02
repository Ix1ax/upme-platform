// src/features/MyCourses/ui/CourseStructureEditor.tsx

import React, { useState } from "react";
import {
    Badge,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { MdOutlineDeleteOutline } from "react-icons/md";

export type LessonType = "lesson" | "test" | "group" | "webinar";

// Вариант ответа в тесте
export type TestOptionForm = {
    id: string;
    key: string;
    text: string;
};

// Вопрос теста
export type TestQuestionForm = {
    id: string;
    text: string;
    options: TestOptionForm[];
    correctKeys: string[]; // массив ключей вариантов, которые правильные
};

export interface Lesson {
    id?: string;
    title: string;
    type: LessonType;
    order: number;

    // markdown-контент (для обычного урока / вебинара)
    markdown?: string;

    // тест внутри модуля
    questions?: TestQuestionForm[];

    // простые поля вебинара
    webinarVideoUrl?: string;
    webinarDuration?: number;
    webinarDatetime?: string;
    webinarHost?: string;
}

export interface Module {
    title: string;
    order: number;
    lessons: Lesson[];
}

// Позиция урока в структуре
export type LessonSelection = {
    moduleIndex: number;
    lessonIndex: number;
};

type Props = {
    value: Module[];
    onChange: (modules: Module[]) => void;

    selected?: LessonSelection | null;
    onSelect?: (selection: LessonSelection | null) => void;
};

function recalcOrders(mods: Module[]): Module[] {
    return mods.map((m, mi) => {
        const lessons: Lesson[] = m.lessons.map((l, li) => ({
            ...l,
            type: (l.type ?? "lesson") as LessonType,
            order: li + 1,
        }));

        return {
            ...m,
            order: mi + 1,
            lessons,
        };
    });
}

// ---------------------------------------
// DnD-редактор структуры курса
// ---------------------------------------
export default function CourseStructureEditor({
                                                  value,
                                                  onChange,
                                                  selected,
                                                  onSelect,
                                              }: Props) {
    const [dragModuleIndex, setDragModuleIndex] = useState<number | null>(null);
    const [overModuleIndex, setOverModuleIndex] = useState<number | null>(null);

    const [dragLesson, setDragLesson] = useState<{
        moduleIndex: number;
        lessonIndex: number;
    } | null>(null);

    const [overLesson, setOverLesson] = useState<{
        moduleIndex: number;
        lessonIndex: number;
    } | null>(null);

    const modules = value ?? [];

    const apply = (next: Module[]) => {
        onChange(recalcOrders(next));
    };

    const addModule = () => {
        apply([
            ...modules,
            {
                title: "Новый модуль",
                order: modules.length + 1,
                lessons: [],
            },
        ]);
    };

    const removeModule = (moduleIndex: number) => {
        apply(modules.filter((_, i) => i !== moduleIndex));
        if (selected && selected.moduleIndex === moduleIndex) {
            onSelect?.(null);
        }
    };

    const updateModuleTitle = (moduleIndex: number, title: string) => {
        apply(
            modules.map((m, i) => (i === moduleIndex ? { ...m, title } : m)),
        );
    };

    const addLesson = (moduleIndex: number) => {
        apply(
            modules.map((m, i) => {
                if (i !== moduleIndex) return m;

                const newLesson: Lesson = {
                    title: "Новый урок",
                    type: "lesson",
                    order: m.lessons.length + 1,
                    markdown: "",
                    questions: [],
                };

                return {
                    ...m,
                    lessons: [...m.lessons, newLesson],
                };
            }),
        );
    };

    const updateLessonTitle = (
        moduleIndex: number,
        lessonIndex: number,
        title: string,
    ) => {
        apply(
            modules.map((m, i) => {
                if (i !== moduleIndex) return m;

                const updatedLessons: Lesson[] = m.lessons.map((l, li) =>
                    li === lessonIndex ? { ...l, title } : l,
                );

                return {
                    ...m,
                    lessons: updatedLessons,
                };
            }),
        );
    };

    const toggleLessonType = (moduleIndex: number, lessonIndex: number) => {
        const order: LessonType[] = ["lesson", "test", "group", "webinar"];

        const next: Module[] = modules.map((m, i) => {
            if (i !== moduleIndex) return m;

            const updatedLessons = m.lessons.map((l, li) => {
                if (li !== lessonIndex) {
                    return {
                        ...l,
                        type: (l.type ?? "lesson") as LessonType,
                    };
                }

                const current = (l.type ?? "lesson") as LessonType;
                const idx = order.indexOf(current);
                const nextType = order[(idx + 1) % order.length];

                return {
                    ...l,
                    type: nextType,
                };
            }) as Lesson[];

            return {
                ...m,
                lessons: updatedLessons,
            } as Module;
        });

        apply(next);
    };

    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        apply(
            modules.map((m, i) => {
                if (i !== moduleIndex) return m;

                const updatedLessons: Lesson[] = m.lessons.filter(
                    (_, li) => li !== lessonIndex,
                );

                return {
                    ...m,
                    lessons: updatedLessons,
                };
            }),
        );

        if (
            selected &&
            selected.moduleIndex === moduleIndex &&
            selected.lessonIndex === lessonIndex
        ) {
            onSelect?.(null);
        }
    };

    const handleModuleDragStart = (index: number, e: React.DragEvent) => {
        setDragModuleIndex(index);
        setOverModuleIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
    };

    const handleModuleDragOver = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        if (overModuleIndex !== index) {
            setOverModuleIndex(index);
        }
    };

    const handleModuleDrop = (index: number, e: React.DragEvent) => {
        e.preventDefault();

        if (dragModuleIndex === null || dragModuleIndex === index) {
            setDragModuleIndex(null);
            setOverModuleIndex(null);
            return;
        }

        const updated = [...modules];
        const [moved] = updated.splice(dragModuleIndex, 1);

        if (!moved) {
            setDragModuleIndex(null);
            setOverModuleIndex(null);
            return;
        }

        updated.splice(index, 0, moved);

        apply(updated);
        setDragModuleIndex(null);
        setOverModuleIndex(null);
    };

    const handleModuleDragEnd = () => {
        setDragModuleIndex(null);
        setOverModuleIndex(null);
    };

    /*
     * DnD уроков
     */
    const handleLessonDragStart = (
        moduleIndex: number,
        lessonIndex: number,
        e: React.DragEvent,
    ) => {
        setDragLesson({ moduleIndex, lessonIndex });
        setOverLesson({ moduleIndex, lessonIndex });
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", `${moduleIndex}:${lessonIndex}`);
    };

    const handleLessonDragOver = (
        moduleIndex: number,
        lessonIndex: number,
        e: React.DragEvent,
    ) => {
        e.preventDefault();
        if (
            !overLesson ||
            overLesson.moduleIndex !== moduleIndex ||
            overLesson.lessonIndex !== lessonIndex
        ) {
            setOverLesson({ moduleIndex, lessonIndex });
        }
    };

    const handleLessonDrop = (
        targetModuleIndex: number,
        targetLessonIndex: number,
        e: React.DragEvent,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragLesson) {
            setOverLesson(null);
            return;
        }

        const { moduleIndex: sourceModuleIndex, lessonIndex: sourceLessonIndex } =
            dragLesson;

        if (
            sourceModuleIndex === targetModuleIndex &&
            sourceLessonIndex === targetLessonIndex
        ) {
            setDragLesson(null);
            setOverLesson(null);
            return;
        }

        const updatedModules = modules.map((m) => ({
            ...m,
            lessons: [...m.lessons],
        }));

        const sourceModule = updatedModules[sourceModuleIndex];
        const targetModule = updatedModules[targetModuleIndex];

        if (!sourceModule || !targetModule) {
            setDragLesson(null);
            setOverLesson(null);
            return;
        }

        const sourceLessons = sourceModule.lessons;
        const [moved] = sourceLessons.splice(sourceLessonIndex, 1);

        if (!moved) {
            setDragLesson(null);
            setOverLesson(null);
            return;
        }

        if (sourceModuleIndex === targetModuleIndex) {
            const sameLessons = sourceModule.lessons;
            sameLessons.splice(targetLessonIndex, 0, moved);
        } else {
            const targetLessons = targetModule.lessons;
            targetLessons.splice(targetLessonIndex, 0, moved);
        }

        apply(updatedModules);
        setDragLesson(null);
        setOverLesson(null);
    };

    const handleLessonDragEnd = () => {
        setDragLesson(null);
        setOverLesson(null);
    };

    const handleLessonDropToModule = (
        targetModuleIndex: number,
        e: React.DragEvent,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragLesson) return;

        const { moduleIndex: sourceModuleIndex, lessonIndex: sourceLessonIndex } =
            dragLesson;

        const updatedModules = modules.map((m) => ({
            ...m,
            lessons: [...m.lessons],
        }));

        const sourceModule = updatedModules[sourceModuleIndex];
        const targetModule = updatedModules[targetModuleIndex];

        if (!sourceModule || !targetModule) {
            setDragLesson(null);
            setOverLesson(null);
            return;
        }

        const sourceLessons = sourceModule.lessons;
        const [moved] = sourceLessons.splice(sourceLessonIndex, 1);

        if (!moved) {
            setDragLesson(null);
            setOverLesson(null);
            return;
        }

        const targetLessons = targetModule.lessons;
        targetLessons.push(moved);

        apply(updatedModules);
        setDragLesson(null);
        setOverLesson(null);
    };

    const handleModuleWrapperDrop = (
        targetModuleIndex: number,
        e: React.DragEvent,
    ) => {
        e.preventDefault();

        if (dragLesson) {
            handleLessonDropToModule(targetModuleIndex, e);
            return;
        }

        if (dragModuleIndex !== null) {
            handleModuleDrop(targetModuleIndex, e);
        }
    };

    return (
        <Stack w={400}>
            <Group justify="space-between" mb="sm">
                <Text fw={700} size="lg">
                    Структура курса
                </Text>
                <Button size="sm" onClick={addModule}>
                    + Добавить модуль
                </Button>
            </Group>

            <Stack w={400}>
                {modules.map((mod, moduleIndex) => {
                    const isDragging = dragModuleIndex === moduleIndex;
                    const isOver = overModuleIndex === moduleIndex;

                    return (
                        <Paper
                            key={moduleIndex}
                            p="md"
                            radius="lg"
                            withBorder
                            onDragOver={(e) => {
                                e.preventDefault();
                                handleModuleDragOver(moduleIndex, e);
                            }}
                            onDrop={(e) => handleModuleWrapperDrop(moduleIndex, e)}
                            style={{
                                cursor: "default",
                                opacity: isDragging ? 0.7 : 1,
                                transform: isDragging ? "scale(0.98)" : "scale(1)",
                                borderColor: isOver ? "#3b82f6" : "#E5E7EB",
                                boxShadow: isOver
                                    ? "0 0 0 2px rgba(59,130,246,0.35)"
                                    : "0 1px 4px rgba(15,23,42,0.08)",
                                transition:
                                    "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease, border-color 120ms ease",
                            }}
                        >
                            <Group mb="xs" justify="space-between">
                                <Group gap={6}>
                                    <div
                                        draggable
                                        onDragStart={(e) => handleModuleDragStart(moduleIndex, e)}
                                        onDragEnd={handleModuleDragEnd}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 6,
                                            background: "#E5E7EB",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "grab",
                                            fontSize: 14,
                                            color: "#6B7280",
                                        }}
                                        title="Перетащите модуль"
                                    >
                                        ☰
                                    </div>
                                    <Text size="xs" c="dimmed">
                                        Перетащите модуль
                                    </Text>
                                </Group>

                                <Button
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => removeModule(moduleIndex)}
                                >
                                    <MdOutlineDeleteOutline size={20} />
                                </Button>
                            </Group>

                            <Group justify="space-between" mb="xs">
                                <TextInput
                                    value={mod.title}
                                    onChange={(e) =>
                                        updateModuleTitle(moduleIndex, e.target.value)
                                    }
                                    style={{ flex: 1 }}
                                />
                            </Group>

                            <Stack>
                                {mod.lessons.map((lesson, lessonIndex) => {
                                    const isDraggingLesson =
                                        dragLesson &&
                                        dragLesson.moduleIndex === moduleIndex &&
                                        dragLesson.lessonIndex === lessonIndex;

                                    const isOverLesson =
                                        overLesson &&
                                        overLesson.moduleIndex === moduleIndex &&
                                        overLesson.lessonIndex === lessonIndex;

                                    const isSelected =
                                        selected &&
                                        selected.moduleIndex === moduleIndex &&
                                        selected.lessonIndex === lessonIndex;

                                    return (
                                        <Paper
                                            key={lessonIndex}
                                            p={10}
                                            withBorder
                                            radius="md"
                                            draggable
                                            onDragStart={(e) =>
                                                handleLessonDragStart(moduleIndex, lessonIndex, e)
                                            }
                                            onDragOver={(e) =>
                                                handleLessonDragOver(moduleIndex, lessonIndex, e)
                                            }
                                            onDrop={(e) =>
                                                handleLessonDrop(moduleIndex, lessonIndex, e)
                                            }
                                            onDragEnd={handleLessonDragEnd}
                                            onClick={() =>
                                                onSelect?.({ moduleIndex, lessonIndex })
                                            }
                                            style={{
                                                borderStyle: "dashed",
                                                cursor: "grab",
                                                backgroundColor: isSelected
                                                    ? "#ECFEFF"
                                                    : isDraggingLesson
                                                        ? "#EEF2FF"
                                                        : isOverLesson
                                                            ? "#EFF6FF"
                                                            : "white",
                                                borderColor: isSelected
                                                    ? "#06b6d4"
                                                    : isOverLesson
                                                        ? "#3b82f6"
                                                        : "#CBD5E1",
                                                boxShadow: isOverLesson
                                                    ? "0 0 0 2px rgba(59,130,246,0.30)"
                                                    : "none",
                                                opacity: isDraggingLesson ? 0.8 : 1,
                                                transform: isDraggingLesson
                                                    ? "scale(0.98)"
                                                    : "scale(1)",
                                                transition:
                                                    "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease, border-color 120ms ease, background-color 120ms ease",
                                            }}
                                        >
                                            <Group justify="space-between">
                                                <Group>
                                                    <Badge
                                                        variant="light"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleLessonType(moduleIndex, lessonIndex);
                                                        }}
                                                    >
                                                        {lesson.type}
                                                    </Badge>

                                                    <TextInput
                                                        value={lesson.title}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateLessonTitle(
                                                                moduleIndex,
                                                                lessonIndex,
                                                                e.target.value,
                                                            );
                                                        }}
                                                    />
                                                </Group>

                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeLesson(moduleIndex, lessonIndex);
                                                    }}
                                                >
                                                    <MdOutlineDeleteOutline size={20} />
                                                </Button>
                                            </Group>
                                        </Paper>
                                    );
                                })}
                            </Stack>

                            <Button size="xs" mt="xs" onClick={() => addLesson(moduleIndex)}>
                                + Добавить урок
                            </Button>
                        </Paper>
                    );
                })}
            </Stack>
        </Stack>
    );
}
