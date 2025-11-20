package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.courseservice.domain.Enrollment;
import ru.ixlax.courseservice.domain.EnrollmentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Сведения о записи пользователя на курс")
public record EnrollmentResponse(
        @Schema(description = "ID записи") UUID id,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "ID пользователя") UUID userId,
        @Schema(description = "Текущий статус записи") EnrollmentStatus status,
        @Schema(description = "Прогресс в процентах") int progressPercent,
        @Schema(description = "Дата создания записи") OffsetDateTime createdAt,
        @Schema(description = "Дата последнего изменения") OffsetDateTime updatedAt,
        @Schema(description = "Дата завершения курса (если зафинишил)") OffsetDateTime completedAt
) {

    public static EnrollmentResponse from(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getId(),
                enrollment.getUserId(),
                enrollment.getStatus(),
                enrollment.getProgressPercent() == null ? 0 : enrollment.getProgressPercent(),
                enrollment.getCreatedAt(),
                enrollment.getUpdatedAt(),
                enrollment.getCompletedAt()
        );
    }
}
