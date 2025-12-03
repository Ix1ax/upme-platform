package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.courseservice.domain.CourseReview;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Отзыв о курсе")
public record CourseReviewResponse(
        @Schema(description = "ID отзыва") UUID id,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "ID автора отзыва") UUID userId,
        @Schema(description = "Оценка от 1 до 5") Integer rating,
        @Schema(description = "Текст отзыва") String comment,
        @Schema(description = "Создан") OffsetDateTime createdAt,
        @Schema(description = "Обновлен") OffsetDateTime updatedAt
) {
    public static CourseReviewResponse from(CourseReview review) {
        return new CourseReviewResponse(
                review.getId(),
                review.getCourse().getId(),
                review.getUserId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
