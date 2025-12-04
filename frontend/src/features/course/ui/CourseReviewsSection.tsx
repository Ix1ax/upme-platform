// features/course/ui/CourseReviewsSection.tsx

import { observer } from "mobx-react-lite";
import {
    Button,
    Card,
    Divider,
    Group,
    Loader,
    Rating,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import courseLearningStore from "@/features/course/model/courseLearningStore";

type Props = {
    courseId: string;
};

const CourseReviewsSection = observer(({ courseId }: Props) => {
    const store = courseLearningStore;

    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState("");

    // признак, можно ли по идее оставить отзыв (по прогрессу)
    const progress = store.progress;

// есть ли вообще итоговый тест по курсу
    const hasTest = progress?.testAvailable === true;

// все ли уроки пройдены
    const allLessonsDone =
        !!progress &&
        progress.totalLessons > 0 &&
        progress.completedLessons >= progress.totalLessons;

// можно ли оставить отзыв
    const canLeaveReview = hasTest
        ? progress?.status === "COMPLETED" || progress?.progressPercent === 100
        : allLessonsDone;

    useEffect(() => {
        if (courseId) {
            store.loadReviews(courseId);
        }
    }, [courseId]);

    const handleSubmit = async () => {
        if (!courseId || !rating) return;

        const trimmed = comment.trim();
        if (!trimmed) {
            alert("Напишите, пожалуйста, короткий комментарий к отзыву");
            return;
        }

        try {
            await store.submitReview(courseId, rating, trimmed);
            // после успешной отправки очищаем локальную форму
            setComment("");
        } catch {
            // текст ошибки уже положен в store.reviewError
        }
    };

    const { reviews, isReviewsLoading, isReviewSaving, reviewError } = store;

    // средний рейтинг по всем отзывам
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
            : 0;

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-end">
                <Title order={3}>Отзывы о курсе</Title>
                {reviews.length > 0 && (
                    <Group gap={8}>
                        <Rating value={averageRating} readOnly fractions={2} />
                        <Text size="sm" c="dimmed">
                            {averageRating.toFixed(1)} · {reviews.length} отзыв(ов)
                        </Text>
                    </Group>
                )}
            </Group>

            {/* Блок формы */}
            <Card withBorder radius="md">
                <Stack gap="sm">
                    <Text fw={500}>Ваш отзыв (анонимно)</Text>

                    {!canLeaveReview && (
                        <Text size="sm" c="dimmed">
                            {hasTest
                                ? "Оставить отзыв можно после прохождения всех уроков и итогового теста."
                                : "Оставить отзыв можно после прохождения всех уроков."}
                        </Text>
                    )}


                    {canLeaveReview && (
                        <>
                            <Group gap="sm">
                                <Text size="sm">Оценка:</Text>
                                <Rating
                                    value={rating ?? 0}
                                    onChange={setRating}
                                    size="md"
                                    fractions={1}
                                />
                            </Group>

                            <Textarea
                                minRows={3}
                                autosize
                                placeholder="Поделитесь впечатлением о курсе…"
                                value={comment}
                                onChange={(e) => setComment(e.currentTarget.value)}
                                disabled={isReviewSaving}
                            />

                            {reviewError && (
                                <Text size="sm" c="red">
                                    {reviewError}
                                </Text>
                            )}

                            <Group justify="flex-end">
                                <Button
                                    onClick={handleSubmit}
                                    loading={isReviewSaving}
                                    disabled={!rating || !comment.trim()}
                                >
                                    Отправить отзыв
                                </Button>
                            </Group>
                        </>
                    )}
                </Stack>
            </Card>

            <Divider label="Отзывы других студентов" labelPosition="center" />

            {/* Список отзывов */}
            {isReviewsLoading ? (
                <Group justify="center">
                    <Loader size="sm" />
                </Group>
            ) : reviews.length === 0 ? (
                <Text size="sm" c="dimmed">
                    Отзывов пока нет — вы можете стать первым 🙂
                </Text>
            ) : (
                <Stack gap="sm">
                    {reviews.map((r) => (
                        <Card key={r.id} withBorder radius="md" padding="sm">
                            <Group justify="space-between" align="flex-start" mb={4}>
                                <Rating value={r.rating} readOnly size="sm" />
                                <Text size="xs" c="dimmed">
                                    {new Date(r.createdAt).toLocaleString()}
                                </Text>
                            </Group>
                            <Text size="sm">{r.comment}</Text>
                        </Card>
                    ))}
                </Stack>
            )}
        </Stack>
    );
});

export default CourseReviewsSection;
