import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    CardSection,
    Group,
    Image,
    Rating,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";
import MyCoursesService from "../api/MyCoursesService";

const FALLBACK_IMG = "/img/plug.avif";

type Props = {
    id: string;
    title: string;
    description: string;
    previewUrl: string | null;
    published: boolean;
    rating: number;
    structureUrl?: string | null;
};

const CourseCard = ({
                        id,
                        title,
                        description,
                        previewUrl,
                        published,
                        rating,
                        structureUrl,
                    }: Props) => {
    const nav = useNavigate();

    // локальный реактивный статус публикации
    const [isPublished, setIsPublished] = useState(published);
    const [publishing, setPublishing] = useState(false);

    // если родитель обновит published (например, после рефреша списка),
    // синхронизируем локальный стейт
    useEffect(() => {
        setIsPublished(published);
    }, [published]);

    const handleTogglePublish = async () => {
        if (publishing) return;

        try {
            setPublishing(true);
            const { data } = await MyCoursesService.togglePublish(id, !isPublished);

            // backend возвращает обновлённый CourseDTO
            setIsPublished(data.published ?? !isPublished);
        } catch (e) {
            console.error("Ошибка публикации:", e);
            // можно добавить уведомление
        } finally {
            setPublishing(false);
        }
    };

    return (
        <Card shadow="sm" radius="lg" withBorder>
            <CardSection>
                <Image
                    src={previewUrl || FALLBACK_IMG}
                    fallbackSrc={FALLBACK_IMG}
                    alt={title}
                    height={160}
                    fit="cover"
                    radius="md"
                />
            </CardSection>

            <Stack gap="xs" mt="md">
                <Group justify="space-between" align="start">
                    <Title order={4} lineClamp={1}>
                        {title}
                    </Title>

                    <Badge
                        variant="light"
                        color={isPublished ? "green" : "gray"}
                    >
                        {isPublished ? "Опубликован" : "Черновик"}
                    </Badge>

                    <Button
                        variant="light"
                        size="xs"
                        loading={publishing}
                        onClick={handleTogglePublish}
                    >
                        {isPublished ? "Скрыть" : "Опубликовать"}
                    </Button>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                    {description}
                </Text>

                <Group gap="xs" mt="xs">
                    <Rating value={rating || 0} readOnly />
                    <Text size="sm" c="dimmed">
                        ({rating || 0})
                    </Text>
                </Group>
            </Stack>

            <Group mt="md" justify="space-between">
                <Button
                    variant="filled"
                    onClick={() => nav(STATIC_LINKS.MY_COURSES_EDIT(id))}
                >
                    Редактировать
                </Button>

                {structureUrl && (
                    <Button
                        component="a"
                        href={structureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                    >
                        Структура
                    </Button>
                )}
            </Group>
        </Card>
    );
};

export default CourseCard;
