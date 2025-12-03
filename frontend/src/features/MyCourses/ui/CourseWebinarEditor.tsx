// features/MyCourses/ui/CourseWebinarEditor.tsx

import {
    Button,
    Group,
    Modal,
    NumberInput,
    Stack,
    Text,
    TextInput,
    FileInput,
} from "@mantine/core";
import { useState } from "react";
import MyCoursesService, {
    type WebinarLessonPayload,
} from "@/features/MyCourses/api/MyCoursesService";

type Props = {
    courseId: string;
    moduleId: string;
    opened: boolean;
    onClose: () => void;
    // чтобы после создания обновить список уроков
    onCreated?: () => void;
};

export default function CourseWebinarEditor({
                                                courseId,
                                                moduleId,
                                                opened,
                                                onClose,
                                                onCreated,
                                            }: Props) {
    const [title, setTitle] = useState("");
    const [orderIndex, setOrderIndex] = useState<number | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSave = async () => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) {
            setFormError("Укажите название вебинара.");
            return;
        }

        if (!file) {
            setFormError("Загрузите видео-файл для вебинара.");
            return;
        }

        setFormError(null);
        setSaving(true);

        try {
            // 1. заливаем видео как ассет курса
            setUploading(true);
            const assetRes = await MyCoursesService.uploadCourseAsset(
                courseId,
                file,
                "webinars", // путь в бакете, можешь поменять
            );
            setUploading(false);

            const data = assetRes.data || {};
            // пытаемся достать URL из разных возможных полей
            const videoUrl =
                data.url || data.publicUrl || Object.values<string>(data)[0];

            if (!videoUrl) {
                setFormError("Бэк не вернул URL загруженного файла.");
                return;
            }

            // 2. создаём вебинар как lesson типа "webinar"
            const payload: WebinarLessonPayload = {
                moduleId,
                title: normalizedTitle,
                type: "webinar",
                orderIndex: orderIndex ?? undefined,
                content: {
                    blocks: [
                        {
                            type: "video",
                            url: videoUrl,
                        },
                    ],
                },
            };

            await MyCoursesService.createWebinarLesson(courseId, payload);

            onCreated?.();
            onClose();
            // Сбросим форму
            setTitle("");
            setOrderIndex(null);
            setFile(null);
            setFormError(null);
        } catch (e) {
            console.error("Ошибка при создании вебинара", e);
            setFormError("Не удалось сохранить вебинар. Проверьте консоль.");
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const isBusy = uploading || saving;

    return (
        <Modal
            opened={opened}
            onClose={isBusy ? () => {} : onClose}
            title="Создать вебинар"
            centered
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    label="Название вебинара"
                    placeholder="Например: Вебинар: Полиморфизм на практике"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                />

                <NumberInput
                    label="Порядковый номер в модуле"
                    description="Необязательно. Если не укажете — проставится автоматически на бэке."
                    min={1}
                    value={orderIndex}
                    onChange={(value) => {
                        const num = Number(value);
                        setOrderIndex(Number.isFinite(num) ? num : null);
                    }}
                />

                <FileInput
                    label="Видео для вебинара"
                    placeholder="Выберите файл"
                    accept="video/*"
                    value={file}
                    onChange={setFile}
                />

                {formError && (
                    <Text size="sm" c="red">
                        {formError}
                    </Text>
                )}

                <Group justify="flex-end" mt="sm">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={isBusy}
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleSave} loading={isBusy}>
                        Сохранить вебинар
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
