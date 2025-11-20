package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.courseservice.domain.EnrollmentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Расширенный прогресс пользователя по курсу")
public record CourseProgressResponse(
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "ID пользователя") UUID userId,
        @Schema(description = "Статус записи (ACTIVE/COMPLETED)") EnrollmentStatus status,
        @Schema(description = "Количество завершенных уроков") int completedLessons,
        @Schema(description = "Всего уроков в курсе") int totalLessons,
        @Schema(description = "Прогресс в процентах") int progressPercent,
        @Schema(description = "ID последнего завершенного урока") UUID lastCompletedLessonId,
        @Schema(description = "Последнее обновление прогресса") OffsetDateTime updatedAt,
        @Schema(description = "Результат последней попытки теста (если есть)") TestAttemptResponse latestTestAttempt,
        @Schema(description = "Есть ли тест для курса") boolean testAvailable
) {}
