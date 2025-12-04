// features/MyCourses/ui/CourseWebinarEditor.tsx

import {
    Button,
    FileInput,
    Group,
    Modal,
    Stack,
    Text,
    TextInput,
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

            const ext = file.name.split(".").pop();
            const unique = `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
            const path = ext ? `webinars/${unique}.${ext}` : `webinars/${unique}`;

            const assetRes = await MyCoursesService.uploadCourseAsset(
                courseId,
                file,
                path,
            );
            setUploading(false);

            const data = assetRes.data || {};
            const videoUrl =
                (data.url as string | undefined) ||
                (data.publicUrl as string | undefined) ||
                (Object.values(data)[0] as string | undefined);

            if (!videoUrl) {
                setFormError("Бэк не вернул URL загруженного файла.");
                return;
            }

            // 2. создаём вебинар как lesson типа "webinar"
            const payload: WebinarLessonPayload = {
                moduleId,
                title: normalizedTitle,
                type: "webinar",
                content: {
                    blocks: [
                        {
                            type: "video",
                            url: videoUrl,
                        },
                    ],
                },
                // orderIndex не задаём — бэк сам поставит в конец
            };

            await MyCoursesService.createWebinarLesson(courseId, payload);

            onCreated?.();
            onClose();

            setTitle("");
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
