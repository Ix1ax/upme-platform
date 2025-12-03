package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на добавление/обновление отзыва о курсе")
public record CourseReviewRequest(
        @NotNull
        @Min(1)
        @Max(5)
        @Schema(description = "Оценка курса от 1 до 5")
        Integer rating,

        @Schema(description = "Текстовый отзыв")
        String comment
) { }
